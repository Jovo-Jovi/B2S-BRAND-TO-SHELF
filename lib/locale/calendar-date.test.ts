import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { formatCalendarDate, parseCalendarDate, startOfWeek, WEEK_STARTS_ON } from "./calendar-date";

const EXAMPLE = "2026-09-23";
const DISPLAY = "23/09/2026";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function eachDay(year: number): string[] {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const dates: string[] = [];
  for (let time = start; time < end; time += 86400000) {
    const probe = new Date(time);
    dates.push(`${probe.getUTCFullYear()}-${pad(probe.getUTCMonth() + 1)}-${pad(probe.getUTCDate())}`);
  }
  return dates;
}

function indic(value: string, base: number): string {
  return [...value]
    .map((char) => {
      if (char >= "0" && char <= "9") {
        return String.fromCodePoint(base + Number(char));
      }
      return char;
    })
    .join("");
}

describe("calendar date, R1-25", () => {
  it("renders the worked example in both locales and parses it back", () => {
    for (const locale of ["en", "ar"] as const) {
      expect(formatCalendarDate(EXAMPLE, locale)).toBe(DISPLAY);
    }
    expect(parseCalendarDate(DISPLAY)).toBe(EXAMPLE);
    expect(parseCalendarDate(EXAMPLE)).toBe(EXAMPLE);
    expect(WEEK_STARTS_ON).toBe("saturday");
  });

  it("refuses an impossible date and folds both Arabic digit ranges", () => {
    expect(parseCalendarDate("31/02/2026")).toBeNull();
    expect(parseCalendarDate("29/02/2026")).toBeNull();
    expect(parseCalendarDate("29/02/2024")).toBe("2024-02-29");
    expect(parseCalendarDate("2026-02-31")).toBeNull();
    expect(parseCalendarDate("3/9/2026")).toBeNull();
    expect(parseCalendarDate(indic("23/09/2026", 0x0660))).toBe(EXAMPLE);
    expect(parseCalendarDate(indic("23/09/2026", 0x06f0))).toBe(EXAMPLE);
  });

  it("round-trips every day of a leap year and a non-leap year", () => {
    expect(eachDay(2024)).toHaveLength(366);
    expect(eachDay(2026)).toHaveLength(365);
    for (const year of [2024, 2026]) {
      for (const iso of eachDay(year)) {
        for (const locale of ["en", "ar"] as const) {
          const display = formatCalendarDate(iso, locale);
          expect(display).not.toBeNull();
          expect(parseCalendarDate(display ?? "")).toBe(iso);
        }
      }
    }
  });

  it("starts the week on Saturday", () => {
    expect(startOfWeek(EXAMPLE)).toBe("2026-09-19");
    expect(startOfWeek("2026-09-19")).toBe("2026-09-19");
    expect(startOfWeek("2026-09-25")).toBe("2026-09-19");
  });

  it("returns the same values west of UTC and east of UTC", () => {
    const href = pathToFileURL(join(process.cwd(), "lib", "locale", "calendar-date.ts")).href;
    const directory = mkdtempSync(join(tmpdir(), "b2s-date-"));
    const probe = join(directory, "probe.mjs");
    writeFileSync(
      probe,
      `import { formatCalendarDate, parseCalendarDate, startOfWeek } from ${JSON.stringify(href)};
const iso = "2026-09-23";
const years = [2024, 2026];
let checksum = 0;
for (const year of years) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  for (let time = start; time < end; time += 86400000) {
    const probeDate = new Date(time);
    const day = String(probeDate.getUTCDate()).padStart(2, "0");
    const month = String(probeDate.getUTCMonth() + 1).padStart(2, "0");
    const value = probeDate.getUTCFullYear() + "-" + month + "-" + day;
    const display = formatCalendarDate(value, "en");
    if (parseCalendarDate(display) !== value) checksum = -1;
    else checksum += 1;
  }
}
console.log(JSON.stringify({
  en: formatCalendarDate(iso, "en"),
  ar: formatCalendarDate(iso, "ar"),
  back: parseCalendarDate("23/09/2026"),
  week: startOfWeek(iso),
  checksum,
  offset: new Date(2026, 8, 23).getTimezoneOffset(),
}));
`,
    );
    function run(timeZone: string) {
      const result = spawnSync(process.execPath, [probe], {
        env: { ...process.env, TZ: timeZone },
        encoding: "utf8",
      });
      expect(result.status, result.stderr).toBe(0);
      return JSON.parse(result.stdout) as {
        en: string;
        ar: string;
        back: string;
        week: string;
        checksum: number;
        offset: number;
      };
    }
    const west = run("America/Los_Angeles");
    const east = run("Asia/Tokyo");
    expect(west.offset).not.toBe(east.offset);
    expect(west.en).toBe(east.en);
    expect(west.ar).toBe(east.ar);
    expect(west.back).toBe(east.back);
    expect(west.week).toBe(east.week);
    expect(west.checksum).toBe(east.checksum);
    expect(west.en).toBe(DISPLAY);
    expect(west.ar).toBe(DISPLAY);
    expect(west.back).toBe(EXAMPLE);
    expect(west.week).toBe("2026-09-19");
    expect(west.checksum).toBe(366 + 365);
  });
});
