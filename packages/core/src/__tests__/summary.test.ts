import { SummaryType } from "@garden/config";
import { actionRequired, rejection, success, summary, warning } from "../summary";

describe("summary helpers", () => {
  const table: ReadonlyArray<
    readonly [name: string, make: () => ReturnType<typeof success>, expectedType: string]
  > = [
    ["success", () => success("ok"), SummaryType.Success],
    ["warning", () => warning("heads up"), SummaryType.Warning],
    ["actionRequired", () => actionRequired("do the thing"), SummaryType.ActionRequired],
    ["rejection", () => rejection("no"), SummaryType.Rejection]
  ];

  it.each(table)("%s returns the expected type and message", (_name, make, expectedType) => {
    const s = make();
    expect(s.type).toBe(expectedType);
    expect(s.message.length).toBeGreaterThan(0);
    expect(s.meta).toBeUndefined();
  });

  it("meta is preserved when provided", () => {
    const s = warning("slope", { sourceRuleId: "sofia.slope", reference: "Article X" });
    expect(s.meta?.sourceRuleId).toBe("sofia.slope");
  });

  it("summary namespace composes the individual helpers", () => {
    expect(summary.success("x").type).toBe(SummaryType.Success);
    expect(summary.rejection("y").type).toBe(SummaryType.Rejection);
  });
});
