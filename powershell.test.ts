import { $ } from "bun";
import { expect, test, describe } from "bun:test";
import { decode } from "@pakakas/markzero";
import { join } from "path";

const scriptPath = join(import.meta.dir, "powershell.ts");

describe("powershell tool", () => {
  test("should execute a simple command", async () => {
    const { stdout } = await $`bun ${scriptPath} "Write-Output hello"`.quiet();
    expect(stdout.toString().trim()).toBe("hello");
  });

  test("should produce MarkZero grid with -L flag", async () => {
    const { stdout } = await $`bun ${scriptPath} -L "Write-Output structured"`.quiet();
    const output = stdout.toString().trim();
    expect(output).toContain("Мassistant");
  });

  test("powershell tool > help payload structure", async () => {
    const { stdout } = await $`bun ${scriptPath} -h`.quiet();
    expect(stdout.toString()).toContain("Safe PowerShell wrapper");
  });
});
