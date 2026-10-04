import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const logPath = resolve("test-results/dev-server.log");
mkdirSync(dirname(logPath), { recursive: true });
const log = createWriteStream(logPath, { flags: "w" });

const port = process.env.B2S_DEV_PORT ?? "3010";
const nextBin = resolve("node_modules/next/dist/bin/next");
const child = spawn(
  process.execPath,
  [nextBin, "dev", "--hostname", "127.0.0.1", "--port", port],
  { stdio: ["inherit", "pipe", "pipe"], env: process.env },
);

function forward(stream) {
  return (chunk) => {
    stream.write(chunk);
    log.write(chunk);
  };
}

child.stdout.on("data", forward(process.stdout));
child.stderr.on("data", forward(process.stderr));

function stop() {
  child.kill("SIGTERM");
}

process.on("SIGTERM", stop);
process.on("SIGINT", stop);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
