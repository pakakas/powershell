import { $ } from "bun";
import { expect, test, describe } from "bun:test";
import { decode } from "../src/pap";

describe("powershell tool", () => {
  test("should execute a simple command", async () => {
    const { stdout } = await $`bun powershell/powershell.ts "Write-Output hello"`.quiet();
    expect(stdout.toString().trim()).toBe("hello");
  });

  test("should produce MarkZero grid with -L flag", async () => {
    const { stdout } = await $`bun powershell/powershell.ts -L "Write-Output structured"`.quiet();
    const results = decode(stdout.toString().trim())[0];
    expect(results[0].status).toBe("OK");
    expect(results[0].stdout).toBe("structured");
  });

  test("powershell tool > help payload structure", async () => {
    const { stdout } = await $`bun powershell/powershell.ts -h`.quiet();
    const blocks = decode(stdout.toString().trim());
    expect(blocks.length).toBe(5);
    const helpMap = blocks[4];
    expect(helpMap.usage).toEqual(blocks[3]);
  });
});
