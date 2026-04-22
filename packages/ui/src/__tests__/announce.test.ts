import { success, warning, actionRequired, rejection } from "@garden/core";
import { announce } from "../announce/announce";
import { hapticPatternFor } from "../announce/haptic-patterns";

describe("announce", () => {
  it("fires all three channels when all are enabled and provided", async () => {
    const tts = jest.fn(async (_t: string) => {});
    const caption = jest.fn((_t: string, _ttl: number) => {});
    const haptic = jest.fn(async (_p: ReadonlyArray<number>) => {});
    await announce(success("ok"), { channels: { tts, caption, haptic } });
    expect(tts).toHaveBeenCalledWith("ok");
    expect(caption).toHaveBeenCalledWith("ok", 5000);
    expect(haptic).toHaveBeenCalledWith([50]);
  });

  it("falls back gracefully when audio is disabled", async () => {
    const tts = jest.fn(async (_t: string) => {});
    const caption = jest.fn((_t: string, _ttl: number) => {});
    const haptic = jest.fn(async (_p: ReadonlyArray<number>) => {});
    await announce(warning("heads up"), {
      channels: { tts, caption, haptic },
      enabled: { tts: false, caption: true, haptic: true }
    });
    expect(tts).not.toHaveBeenCalled();
    expect(caption).toHaveBeenCalled();
    expect(haptic).toHaveBeenCalled();
  });

  it("uses the configured caption TTL", async () => {
    const caption = jest.fn((_t: string, _ttl: number) => {});
    await announce(actionRequired("go"), {
      channels: { caption },
      captionTtlMs: 9000
    });
    expect(caption).toHaveBeenCalledWith("go", 9000);
  });

  it("missing channels are silently skipped", async () => {
    await expect(announce(rejection("no"))).resolves.toBeUndefined();
  });
});

describe("hapticPatternFor", () => {
  const cases: ReadonlyArray<readonly [type: string, lengthExpected: number]> = [
    ["success", 1],
    ["warning", 3],
    ["actionRequired", 5],
    ["rejection", 1]
  ];
  it.each(cases)("%s has %d pattern elements", (type, n) => {
    const pattern = hapticPatternFor(
      type as "success" | "warning" | "actionRequired" | "rejection"
    );
    expect(pattern).toHaveLength(n);
  });
});
