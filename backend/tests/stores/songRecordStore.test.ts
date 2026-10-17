import { describe, expect, it } from "vitest";
import { SongRecordStore } from "../../src/stores/songRecordStore";
import { createFakeRedis } from "./fakeRedis";

describe("SongRecordStore", () => {
  it("returns null when no record exists", async () => {
    const store = new SongRecordStore(createFakeRedis());
    expect(await store.find("u1", "local:abc")).toBeNull();
  });

  it("scopes records by userId + songKey", async () => {
    const store = new SongRecordStore(createFakeRedis());
    const recordA = { userId: "u1", songKey: "local:abc", loopPoints: null, memo: null, updatedAt: 1 };
    const recordB = { userId: "u2", songKey: "local:abc", loopPoints: null, memo: null, updatedAt: 2 };
    await store.save(recordA);
    await store.save(recordB);

    expect(await store.find("u1", "local:abc")).toEqual(recordA);
    expect(await store.find("u2", "local:abc")).toEqual(recordB);
  });
});
