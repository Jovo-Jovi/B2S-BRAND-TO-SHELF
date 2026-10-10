import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Row = { step: string; verdict: string };

function phaseStatus(pid: string, rows: Row[], current: string): string {
  const dir = mkdtempSync(join(tmpdir(), "b2s-phase-"));
  const file = join(dir, "status.py");
  const payload = JSON.stringify({ pid, rows, current });
  writeFileSync(
    file,
    [
      "import importlib.util, json, pathlib",
      `payload = json.loads(${JSON.stringify(payload)})`,
      `root = pathlib.Path(${JSON.stringify(process.cwd())})`,
      'spec = importlib.util.spec_from_file_location("generate_roadmap", root / "scripts" / "generate_roadmap.py")',
      "mod = importlib.util.module_from_spec(spec)",
      "spec.loader.exec_module(mod)",
      'print(mod.phase_status(payload["pid"], payload["rows"], payload["current"]))',
      "",
    ].join("\n"),
    "utf8",
  );
  return execFileSync("python", [file], { encoding: "utf8" }).trim();
}

describe("roadmap phase status", () => {
  const current = "P03";

  it("marks P01 done from a numbered re-run and P02 done from its gate", () => {
    const rows: Row[] = [
      { step: "P01-GATE", verdict: "FAIL" },
      { step: "P01-GATE-RUN3", verdict: "PASS" },
      { step: "P02-GATE", verdict: "PASS" },
      { step: "P03-GATE", verdict: "FAIL" },
    ];
    expect(phaseStatus("P01", rows, current)).toBe("DONE");
    expect(phaseStatus("P02", rows, current)).toBe("DONE");
    expect(phaseStatus("P03", rows, current)).toBe("IN PROGRESS");
  });

  it("does not count a fix task as a gate run", () => {
    const rows: Row[] = [{ step: "P03-GATE-FIX", verdict: "PASS" }];
    expect(phaseStatus("P03", rows, current)).toBe("IN PROGRESS");
  });
});
