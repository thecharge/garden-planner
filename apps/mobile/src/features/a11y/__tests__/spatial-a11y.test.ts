import { createDebouncedAnnouncer, utteranceFor } from "../hooks/use-spatial-a11y";

describe("spatial a11y debouncer", () => {
  it("suppresses repeated announcements within the window", () => {
    const fired: string[] = [];
    let t = 0;
    const deb = createDebouncedAnnouncer({ announce: (m) => fired.push(m) }, () => t);
    deb.announce("facing", "Facing north");
    t = 100;
    deb.announce("facing", "Facing north");
    t = 1500;
    deb.announce("facing", "Facing north");
    expect(fired).toEqual(["Facing north", "Facing north"]);
  });

  it("distinct keys fire independently", () => {
    const fired: string[] = [];
    const deb = createDebouncedAnnouncer({ announce: (m) => fired.push(m) }, () => 0);
    deb.announce("facing", "Facing north");
    deb.announce("verdict", "Compliant");
    deb.announce("object", "Corner 1 of 3");
    expect(fired).toHaveLength(3);
  });
});

describe("utteranceFor", () => {
  const cases = [
    [{ kind: "facing-changed", heading: "west" }, "Facing west."],
    [{ kind: "object-detected", label: "Corner 2 of 3, 3.2 m away" }, "Corner 2 of 3, 3.2 m away"],
    [{ kind: "verdict-updated", verdict: "Compliant." }, "Compliant."],
    [{ kind: "boundary-corner-added", cornerIndex: 2 }, "Corner 2 added."]
  ] as const;
  it.each(cases)("translates %o", (event, expected) => {
    expect(utteranceFor(event)).toBe(expected);
  });
});
