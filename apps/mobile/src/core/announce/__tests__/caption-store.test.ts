import { captionStore } from "../caption-store";

jest.useFakeTimers();

describe("captionStore", () => {
  beforeEach(() => {
    captionStore.getState().clearCaption();
  });

  it("pushCaption sets the text and expiresAt, clears after TTL", () => {
    captionStore.getState().pushCaption("Sector saved", 5000);
    expect(captionStore.getState().text).toBe("Sector saved");
    expect(captionStore.getState().expiresAt).not.toBeNull();

    jest.advanceTimersByTime(4999);
    expect(captionStore.getState().text).toBe("Sector saved");

    jest.advanceTimersByTime(1);
    expect(captionStore.getState().text).toBeNull();
    expect(captionStore.getState().expiresAt).toBeNull();
  });

  it("second pushCaption replaces the first and resets the timer", () => {
    captionStore.getState().pushCaption("first", 5000);
    jest.advanceTimersByTime(2000);
    expect(captionStore.getState().text).toBe("first");

    captionStore.getState().pushCaption("second", 5000);
    expect(captionStore.getState().text).toBe("second");

    jest.advanceTimersByTime(4999);
    expect(captionStore.getState().text).toBe("second");

    jest.advanceTimersByTime(1);
    expect(captionStore.getState().text).toBeNull();
  });

  it("clearCaption removes text immediately and cancels the pending timer", () => {
    captionStore.getState().pushCaption("will be cleared", 5000);
    captionStore.getState().clearCaption();
    expect(captionStore.getState().text).toBeNull();
    jest.advanceTimersByTime(5000);
    expect(captionStore.getState().text).toBeNull();
  });
});
