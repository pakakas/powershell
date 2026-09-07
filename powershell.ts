import { spawn } from "bun";

export function help() {
}

export async function run(args: string[]) {
  const flags = {
    structured: args.includes("-L"),
    ascii: args.includes('--ascii') || args.includes('--a'),
  };

  let command = "";
  const filteredArgs = args.filter(arg => arg !== "-L" && arg !== "--ascii" && arg !== "--a");

  const cIndex = filteredArgs.indexOf("-Command");
  if (cIndex !== -1 && filteredArgs[cIndex + 1]) {
      command = filteredArgs[cIndex + 1];
  } else {
      command = filteredArgs.join(" ");
  }

  if (!command) {
      help();
      return;
  }

  const shell = process.platform === "win32" ? "pwsh.exe" : "pwsh";
  const useStdout = !flags.structured && !flags.ascii && !decoder;

  const proc = spawn([shell, "-NoProfile", "-Command", command], {
    stdin: "inherit",
    stdout: useStdout ? "inherit" : "pipe",
    stderr: useStdout ? "inherit" : "pipe",
  });

  const status = await proc.exited;

  if (!useStdout) {
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    const result = {
      command: command,
      status: status === 0 ? "OK" : status,
      stdout: stdout.trim(),
      stderr: stderr.trim()
    };

    if (flags.ascii) {
      console.table([result]);
    }
  }
}

if (import.meta.main) {
  run(process.argv.slice(2));
}
