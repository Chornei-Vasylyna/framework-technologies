import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
  exec: (_, cb) => {
    cb(null, "dump", "");
  },
}));

vi.mock("node:stream/promises", () => ({
  pipeline: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("node:fs", () => ({
  createWriteStream: vi.fn(),
}));

import {
  atomicWriteJson,
  createMysqlBackup,
  ensureDir,
} from "#utils/fileStorage.js";

describe("fileStorage", () => {
  it("creates directory", async () => {
    const dir = path.join(os.tmpdir(), `labs-test-${Date.now()}`);
    await ensureDir(dir);
    const stat = await fs.stat(dir);
    expect(stat.isDirectory()).toBe(true);
  });

  it("writes json atomically", async () => {
    const dir = path.join(os.tmpdir(), `labs-json-${Date.now()}`);
    await ensureDir(dir);
    const filePath = path.join(dir, "data.json");

    await atomicWriteJson(filePath, { ok: true });
    const json = JSON.parse(await fs.readFile(filePath, "utf8"));
    expect(json.ok).toBe(true);
  });

  it("retries atomic write when destination already exists", async () => {
    const dir = path.join(os.tmpdir(), `labs-json-retry-${Date.now()}`);
    await ensureDir(dir);
    const filePath = path.join(dir, "data.json");
    const renameSpy = vi
      .spyOn(fs, "rename")
      .mockRejectedValueOnce(
        Object.assign(new Error("exists"), { code: "EEXIST" }),
      )
      .mockResolvedValueOnce();
    const rmSpy = vi.spyOn(fs, "rm").mockResolvedValue();

    await atomicWriteJson(filePath, { ok: true });

    expect(renameSpy).toHaveBeenCalledTimes(2);
    expect(rmSpy).toHaveBeenCalledWith(filePath, { force: true });
    expect(
      JSON.parse(await fs.readFile(path.join(dir, "data.tmp.json"), "utf8")),
    ).toEqual({
      ok: true,
    });

    renameSpy.mockRestore();
    rmSpy.mockRestore();
  });

  it("removes temp file when atomic write fails unexpectedly", async () => {
    const dir = path.join(os.tmpdir(), `labs-json-fail-${Date.now()}`);
    await ensureDir(dir);
    const filePath = path.join(dir, "data.json");
    const tempPath = path.join(dir, "data.tmp.json");
    const renameSpy = vi
      .spyOn(fs, "rename")
      .mockRejectedValueOnce(
        Object.assign(new Error("boom"), { code: "ENOENT" }),
      );
    const rmSpy = vi.spyOn(fs, "rm").mockResolvedValue();

    await expect(atomicWriteJson(filePath, { ok: true })).rejects.toThrow(
      "boom",
    );

    expect(rmSpy).toHaveBeenCalledWith(tempPath, { force: true });

    renameSpy.mockRestore();
    rmSpy.mockRestore();
  });

  it("cleans old mysql backups after a successful dump", async () => {
    const backupsDir = path.join(os.tmpdir(), `labs-backups-${Date.now()}`);
    await ensureDir(backupsDir);

    await fs.writeFile(
      path.join(backupsDir, "2000-01-01T00-00-00-000Z.gz"),
      "old-1",
    );
    await fs.writeFile(
      path.join(backupsDir, "2001-01-01T00-00-00-000Z.gz"),
      "old-2",
    );
    await fs.writeFile(path.join(backupsDir, "keep.txt"), "ignore-me");

    await createMysqlBackup({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "secret",
      database: "db",
      backupsDir,
      maxBackups: 1,
    });

    const files = await fs.readdir(backupsDir);
    const gzFiles = files.filter((name) => name.endsWith(".gz"));

    expect(gzFiles).toHaveLength(1);
    expect(files).toContain("keep.txt");
  });

  it("keeps the default number of mysql backups when maxBackups is omitted", async () => {
    const backupsDir = path.join(
      os.tmpdir(),
      `labs-backups-default-${Date.now()}`,
    );
    await ensureDir(backupsDir);

    for (let index = 0; index < 6; index += 1) {
      const day = String(index + 1).padStart(2, "0");
      await fs.writeFile(
        path.join(backupsDir, `2000-01-${day}T00-00-00-000Z.gz`),
        `old-${index}`,
      );
    }

    await createMysqlBackup({
      host: "localhost",
      port: 3306,
      user: "root",
      database: "db",
      backupsDir,
    });

    const files = await fs.readdir(backupsDir);
    const gzFiles = files.filter((name) => name.endsWith(".gz"));

    expect(gzFiles).toHaveLength(5);
  });

  it("throws when mysql config missing", async () => {
    await expect(
      createMysqlBackup({ backupsDir: os.tmpdir() }),
    ).rejects.toThrow(/Missing required MySQL configuration/);
  });
});
