import { spawn } from "bun";
import { encode as encodeMacro } from "../src/pap.ts" with { type: 'macro' };
import { mergeHelp } from "../src/help.ts" with { type: 'macro' };
import { encode } from "../src/pap.ts";

const papHelp = encodeMacro(mergeHelp({
  usage: "powershell [options] [command]",
  command_desc: "Safe PowerShell wrapper",
  flag: ["-Command", "-L", "--ascii"],
  desc: [
    "Execute the specified commands",
    "Structured output mode (MarkZero result block)",
    "Display formatted output"
  ]
}));

export function help(decoder?: (pap: string) => void) {
  if (decoder) decoder(papHelp);
  else process.stdout.write(papHelp + '\n');
}

export async function run(args: string[], decoder?: (pap: string) => void) {
  const isHumanHelp = args.includes('--h') || args.includes('--ha') || args.includes('--ah') || args.includes('-hasci') || args.includes('-hascii') || args.includes('--hasci') || args.includes('--hascii');

  if (args.includes('--help') || args.includes('-h') || isHumanHelp) {
    if (isHumanHelp && !decoder) {
      const { mark0ToAscii } = await import('../.internal/pakakas-konsep/markzero-ascii.ts');
      help(mark0ToAscii);
    } else {
      help(decoder);
    }
    return;
  }

  const flags = {
    structured: args.includes("-L"),
    ascii: args.includes('--ascii') || args.includes('--a') || isHumanHelp,
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

    const papData = encode([ [result] ]);
    if (flags.ascii && !decoder) {
      console.table([result]);
    } else if (decoder) {
      decoder(papData);
    } else {
      process.stdout.write(papData + '\n');
    }
  }
}

if (import.meta.main) {
  run(process.argv.slice(2));
}
