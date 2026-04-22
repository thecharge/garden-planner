import { createLogger, setTransport } from "../index";
import type { LogRecord } from "../index";

describe("logger", () => {
  const captured: LogRecord[] = [];

  beforeEach(() => {
    captured.length = 0;
    setTransport((r) => {
      captured.push(r);
    });
  });

  it("tags every emitted line", () => {
    const log = createLogger("yield");
    log.info("hello");
    expect(captured[0]?.tag).toBe("yield");
    expect(captured[0]?.message).toBe("hello");
  });

  it.each([
    ["info", 1],
    ["warn", 1],
    ["error", 1]
  ] as const)("%s at level 'info' passes the level gate", (level, count) => {
    const log = createLogger("t");
    log[level]("x");
    expect(captured).toHaveLength(count);
  });

  it("transport swap routes subsequent calls to the new sink", () => {
    const sinkA: LogRecord[] = [];
    const sinkB: LogRecord[] = [];
    setTransport((r) => sinkA.push(r));
    createLogger("a").info("to-a");
    setTransport((r) => sinkB.push(r));
    createLogger("b").info("to-b");
    expect(sinkA.map((r) => r.tag)).toEqual(["a"]);
    expect(sinkB.map((r) => r.tag)).toEqual(["b"]);
  });
});
