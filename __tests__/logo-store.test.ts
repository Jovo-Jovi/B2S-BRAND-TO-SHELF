import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { inspectLogo } from "../lib/logo/logo-file";
import {
  logoStoreSession,
  mintLogoReadUrl,
  SIGNED_URL_SECONDS,
  STORED_BUCKET,
  STORED_PROVIDER,
  storeLogo,
  type LogoStoreSession,
  type MediaAssetInsert,
  type MemberMediaClient,
  type RenditionInsert,
} from "../lib/logo/store-logo";

const TENANT = "11111111-1111-4111-8111-111111111111";
const MEMBER = "22222222-2222-4222-8222-222222222222";

function png(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d], 0);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function svg(body: string): Uint8Array {
  return new TextEncoder().encode(`<svg xmlns="http://www.w3.org/2000/svg">${body}</svg>`);
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function session(failOnWrite?: number): {
  store: LogoStoreSession;
  objects: Map<string, Uint8Array>;
  assets: MediaAssetInsert[];
  renditions: RenditionInsert[];
  archived: string[];
  signed: number[];
} {
  const objects = new Map<string, Uint8Array>();
  const assets: MediaAssetInsert[] = [];
  const renditions: RenditionInsert[] = [];
  const archived: string[] = [];
  const signed: number[] = [];
  let writes = 0;
  const store: LogoStoreSession = {
    tenantId: TENANT,
    memberId: MEMBER,
    async writeObject(key, bytes) {
      writes += 1;
      if (failOnWrite !== undefined && writes === failOnWrite) {
        throw new Error("upload refused");
      }
      objects.set(key, bytes);
    },
    async readObject(key) {
      const found = objects.get(key);
      if (!found) {
        throw new Error("missing");
      }
      return found;
    },
    async signObject(_key, seconds) {
      signed.push(seconds);
      return "https://signed.example/object";
    },
    async insertAsset(row) {
      assets.push(row);
    },
    async insertRendition(row) {
      renditions.push(row);
    },
    async archive(mediaAssetId) {
      archived.push(mediaAssetId);
    },
  };
  return { store, objects, assets, renditions, archived, signed };
}

describe("storeLogo", () => {
  it("refuses a file over 5 MB and writes nothing", async () => {
    const { store, objects, assets } = session();
    const result = await storeLogo({ bytes: new Uint8Array(5_000_001), filename: "big.png" }, store);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("too-large");
      expect(result.archived).toBe(false);
    }
    expect(objects.size).toBe(0);
    expect(assets).toEqual([]);
  });

  it("refuses a file that is neither SVG nor PNG and writes nothing", async () => {
    const { store, objects, assets } = session();
    const result = await storeLogo({ bytes: new TextEncoder().encode("hello"), filename: "a.txt" }, store);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not-svg-or-png");
      expect(result.archived).toBe(false);
    }
    expect(objects.size).toBe(0);
    expect(assets).toEqual([]);
  });

  it("refuses a PNG below 1000 pixels on its shorter side and writes nothing", async () => {
    const { store, objects, assets } = session();
    const result = await storeLogo({ bytes: png(999, 2000), filename: "small.png" }, store);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("png-shorter-side");
      expect(result.archived).toBe(false);
    }
    expect(objects.size).toBe(0);
    expect(assets).toEqual([]);
  });

  it("refuses an SVG with active content and writes nothing", async () => {
    const { store, objects, assets } = session();
    const result = await storeLogo(
      { bytes: svg("<script>alert(1)</script>"), filename: "mark.svg" },
      store,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("active-content");
      expect(result.archived).toBe(false);
    }
    expect(objects.size).toBe(0);
    expect(assets).toEqual([]);
  });

  it("stores a cleaned SVG as three objects whose hashes match the asset", async () => {
    const { store, objects, assets, renditions } = session();
    const original = svg("<!-- note --><metadata>secret</metadata><circle r='8'/>");
    const result = await storeLogo({ bytes: original, filename: "mark.svg" }, store);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const cleaned = inspectLogo(original);
    expect(cleaned.ok).toBe(true);
    if (!cleaned.ok) {
      return;
    }
    expect(result.checksum).toBe(sha256(cleaned.bytes));
    expect(result.checksum).not.toBe(sha256(original));
    expect(objects.size).toBe(3);
    for (const key of Object.values(result.objectKeys)) {
      expect(key.startsWith(`${TENANT}/`)).toBe(true);
      expect(sha256(objects.get(key)!)).toBe(result.checksum);
    }
    expect(result.objectKeys.original.endsWith("/original.svg")).toBe(true);
    expect(result.objectKeys.display.endsWith("/display.svg")).toBe(true);
    expect(result.objectKeys.print.endsWith("/print.svg")).toBe(true);
    expect(assets).toHaveLength(1);
    expect(assets[0].provider).toBe(STORED_PROVIDER);
    expect(assets[0].bucket).toBe(STORED_BUCKET);
    expect(assets[0].content_type).toBe("image/svg+xml");
    expect(assets[0].checksum).toBe(result.checksum);
    expect(renditions.map((row) => row.tier).sort()).toEqual(["display", "print"]);
    expect(renditions.every((row) => row.width_px === null && row.height_px === null)).toBe(true);
  });

  it("stores a PNG with its pixel size on both renditions", async () => {
    const { store, assets, renditions } = session();
    const result = await storeLogo({ bytes: png(1200, 1000), filename: "mark.png" }, store);
    expect(result.ok).toBe(true);
    expect(assets[0].content_type).toBe("image/png");
    expect(renditions.every((row) => row.width_px === 1200 && row.height_px === 1000)).toBe(true);
  });

  it("archives the rows and keeps the written object when a later write fails", async () => {
    const { store, objects, archived, assets } = session(2);
    const result = await storeLogo({ bytes: png(1000, 1000), filename: "mark.png" }, store);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("object-write");
      expect(result.archived).toBe(true);
    }
    expect(archived).toEqual([assets[0].id]);
    expect(objects.size).toBe(1);
    expect(assets[0].object_key.endsWith("/original.png")).toBe(true);
  });

  it("archives the rows when a copy does not hash to the asset checksum", async () => {
    const base = session();
    const lying: LogoStoreSession = {
      ...base.store,
      async readObject() {
        return new Uint8Array([1, 2, 3, 4]);
      },
    };
    const result = await storeLogo({ bytes: png(1000, 1000), filename: "mark.png" }, lying);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("copy-mismatch");
      expect(result.archived).toBe(true);
    }
    expect(base.objects.size).toBe(1);
    expect(base.archived).toEqual([base.assets[0].id]);
  });

  it("mints a read URL for 300 seconds", async () => {
    const { store, signed } = session();
    const url = await mintLogoReadUrl(store, `${TENANT}/asset/original.png`);
    expect(url).toBe("https://signed.example/object");
    expect(signed).toEqual([SIGNED_URL_SECONDS]);
    expect(SIGNED_URL_SECONDS).toBe(300);
  });

  it("writes through the member client into tenant-media and does not replace an object", async () => {
    const uploads: { bucket: string; upsert: boolean; contentType: string }[] = [];
    const signedFor: number[] = [];
    const client: MemberMediaClient = {
      storage: {
        from(bucket) {
          return {
            async upload(_path, _body, options) {
              uploads.push({ bucket, upsert: options.upsert, contentType: options.contentType });
              return { error: null };
            },
            async download() {
              const bytes = png(1000, 1000);
              const copy = new ArrayBuffer(bytes.byteLength);
              new Uint8Array(copy).set(bytes);
              return { data: new Blob([copy]), error: null };
            },
            async createSignedUrl(_path, expiresIn) {
              signedFor.push(expiresIn);
              return { data: { signedUrl: "https://signed.example/member" }, error: null };
            },
          };
        },
      },
      from() {
        return {
          async insert() {
            return { error: null };
          },
          update() {
            return { async eq() { return { error: null }; } };
          },
        };
      },
    };
    const bound = logoStoreSession(client, TENANT, MEMBER);
    const result = await storeLogo({ bytes: png(1000, 1000), filename: null }, bound);
    expect(result.ok).toBe(true);
    expect(uploads).toHaveLength(3);
    expect(uploads.every((upload) => upload.bucket === STORED_BUCKET && upload.upsert === false)).toBe(true);
    expect(uploads[0].contentType).toBe("image/png");
    const url = await mintLogoReadUrl(bound, `${TENANT}/x/original.png`);
    expect(url).toBe("https://signed.example/member");
    expect(signedFor).toEqual([300]);
  });
});
