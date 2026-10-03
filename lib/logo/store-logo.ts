import { createHash, randomUUID } from "node:crypto";

import { inspectLogo, type LogoFile } from "./logo-file";

// BRAND_CONFIG.md §9's amendment, and DATA_MODEL.md's Asset tier.
// This module writes nothing until inspectLogo accepts the file. It is
// wired to no route. P03-T22's Brand step is what calls it.

export const STORED_PROVIDER = "supabase-storage";
export const STORED_BUCKET = "tenant-media";
export const SIGNED_URL_SECONDS = 300;

const FORMAT = {
  png: { extension: "png", contentType: "image/png" },
  svg: { extension: "svg", contentType: "image/svg+xml" },
} as const;

export type MediaAssetInsert = {
  id: string;
  tenant_id: string;
  provider: string;
  bucket: string;
  object_key: string;
  content_type: string;
  byte_size: number;
  checksum: string;
  original_filename: string | null;
  created_by: string;
};

export type RenditionInsert = {
  id: string;
  tenant_id: string;
  media_asset_id: string;
  tier: "display" | "print";
  provider: string;
  bucket: string;
  object_key: string;
  width_px: number | null;
  height_px: number | null;
  content_type: string;
  byte_size: number;
  created_by: string;
};

export type LogoStoreSession = {
  tenantId: string;
  memberId: string;
  writeObject(objectKey: string, bytes: Uint8Array, contentType: string): Promise<void>;
  readObject(objectKey: string): Promise<Uint8Array>;
  signObject(objectKey: string, seconds: number): Promise<string>;
  insertAsset(row: MediaAssetInsert): Promise<void>;
  insertRendition(row: RenditionInsert): Promise<void>;
  archive(mediaAssetId: string): Promise<void>;
};

type Refusal = Extract<LogoFile, { ok: false }>["reason"];

export type StoreLogoResult =
  | {
      ok: true;
      mediaAssetId: string;
      checksum: string;
      objectKeys: { original: string; display: string; print: string };
    }
  | { ok: false; reason: Refusal | "object-write" | "copy-mismatch"; message: string; archived: boolean };

type WriteError = { message: string } | null;

export type MemberMediaClient = {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: Uint8Array,
        options: { contentType: string; upsert: boolean },
      ): Promise<{ error: WriteError }>;
      download(path: string): Promise<{ data: Blob | null; error: WriteError }>;
      createSignedUrl(
        path: string,
        expiresIn: number,
      ): Promise<{ data: { signedUrl: string } | null; error: WriteError }>;
    };
  };
  from(table: "media_asset" | "asset_rendition"): {
    insert(row: MediaAssetInsert | RenditionInsert): Promise<{ error: WriteError }>;
    update(values: { archived_at: string }): {
      eq(column: string, value: string): Promise<{ error: WriteError }>;
    };
  };
};

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function pngSize(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function objectKey(tenantId: string, mediaAssetId: string, name: string, extension: string): string {
  return `${tenantId}/${mediaAssetId}/${name}.${extension}`;
}

export async function storeLogo(
  file: { bytes: Uint8Array; filename: string | null },
  session: LogoStoreSession,
): Promise<StoreLogoResult> {
  const inspected = inspectLogo(file.bytes);
  if (!inspected.ok) {
    return { ok: false, reason: inspected.reason, message: inspected.message, archived: false };
  }

  const stored = inspected.bytes;
  const checksum = sha256Hex(stored);
  const format = FORMAT[inspected.format];
  const mediaAssetId = randomUUID();
  const keys = {
    original: objectKey(session.tenantId, mediaAssetId, "original", format.extension),
    display: objectKey(session.tenantId, mediaAssetId, "display", format.extension),
    print: objectKey(session.tenantId, mediaAssetId, "print", format.extension),
  };
  const pixels = inspected.format === "png" ? pngSize(stored) : null;
  let rowsExist = false;

  try {
    await session.insertAsset({
      id: mediaAssetId,
      tenant_id: session.tenantId,
      provider: STORED_PROVIDER,
      bucket: STORED_BUCKET,
      object_key: keys.original,
      content_type: format.contentType,
      byte_size: stored.byteLength,
      checksum,
      original_filename: file.filename,
      created_by: session.memberId,
    });
    rowsExist = true;
    for (const tier of ["display", "print"] as const) {
      await session.insertRendition({
        id: randomUUID(),
        tenant_id: session.tenantId,
        media_asset_id: mediaAssetId,
        tier,
        provider: STORED_PROVIDER,
        bucket: STORED_BUCKET,
        object_key: keys[tier],
        width_px: pixels?.width ?? null,
        height_px: pixels?.height ?? null,
        content_type: format.contentType,
        byte_size: stored.byteLength,
        created_by: session.memberId,
      });
    }
    for (const key of [keys.original, keys.display, keys.print]) {
      await session.writeObject(key, stored, format.contentType);
      const copy = await session.readObject(key);
      if (sha256Hex(copy) !== checksum) {
        throw new Error("copy-mismatch");
      }
    }
  } catch (error) {
    if (!rowsExist) {
      throw error;
    }
    await session.archive(mediaAssetId);
    const mismatch = error instanceof Error && error.message === "copy-mismatch";
    return {
      ok: false,
      reason: mismatch ? "copy-mismatch" : "object-write",
      message: mismatch
        ? "A stored copy did not match the asset checksum."
        : "The object was not fully written. The rows are archived and keep their keys.",
      archived: true,
    };
  }

  return { ok: true, mediaAssetId, checksum, objectKeys: keys };
}

export async function mintLogoReadUrl(session: LogoStoreSession, objectKey: string): Promise<string> {
  return session.signObject(objectKey, SIGNED_URL_SECONDS);
}

function raise(error: WriteError, what: string): void {
  if (error) {
    throw new Error(`${what}: ${error.message}`);
  }
}

export function logoStoreSession(
  client: MemberMediaClient,
  tenantId: string,
  memberId: string,
): LogoStoreSession {
  const bucket = client.storage.from(STORED_BUCKET);
  return {
    tenantId,
    memberId,
    async writeObject(key, bytes, contentType) {
      const result = await bucket.upload(key, bytes, { contentType, upsert: false });
      raise(result.error, "write");
    },
    async readObject(key) {
      const result = await bucket.download(key);
      raise(result.error, "read");
      if (!result.data) {
        throw new Error("read: the stored object was empty");
      }
      return new Uint8Array(await result.data.arrayBuffer());
    },
    async signObject(key, seconds) {
      const result = await bucket.createSignedUrl(key, seconds);
      raise(result.error, "sign");
      if (!result.data?.signedUrl) {
        throw new Error("sign: no URL was returned");
      }
      return result.data.signedUrl;
    },
    async insertAsset(row) {
      raise((await client.from("media_asset").insert(row)).error, "insert asset");
    },
    async insertRendition(row) {
      raise((await client.from("asset_rendition").insert(row)).error, "insert rendition");
    },
    async archive(mediaAssetId) {
      const archivedAt = new Date().toISOString();
      raise(
        (await client.from("media_asset").update({ archived_at: archivedAt }).eq("id", mediaAssetId)).error,
        "archive asset",
      );
      raise(
        (
          await client
            .from("asset_rendition")
            .update({ archived_at: archivedAt })
            .eq("media_asset_id", mediaAssetId)
        ).error,
        "archive rendition",
      );
    },
  };
}
