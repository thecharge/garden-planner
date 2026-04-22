import { SmepError, SmepErrorCode, SmepErrors } from "../errors";

describe("SmepErrors factory", () => {
  const factoryCalls = [
    ["protocolEmpty", () => SmepErrors.protocolEmpty(), SmepErrorCode.ProtocolEmpty],
    ["captureTooShort", () => SmepErrors.captureTooShort(), SmepErrorCode.CaptureTooShort],
    [
      "providerNotConfigured",
      () => SmepErrors.providerNotConfigured(),
      SmepErrorCode.ProviderNotConfigured
    ],
    [
      "repositoryUnavailable",
      () => SmepErrors.repositoryUnavailable(),
      SmepErrorCode.RepositoryUnavailable
    ],
    [
      "invalidProviderConfig",
      () => SmepErrors.invalidProviderConfig("bad"),
      SmepErrorCode.InvalidProviderConfig
    ],
    [
      "insufficientSoilData",
      () => SmepErrors.insufficientSoilData(),
      SmepErrorCode.InsufficientSoilData
    ],
    ["sectorNotFound", () => SmepErrors.sectorNotFound("s-1"), SmepErrorCode.SectorNotFound],
    [
      "unsupportedClimateZone",
      () => SmepErrors.unsupportedClimateZone("mars"),
      SmepErrorCode.UnsupportedClimateZone
    ],
    [
      "invalidHarvestWeight",
      () => SmepErrors.invalidHarvestWeight(-1),
      SmepErrorCode.InvalidHarvestWeight
    ]
  ] as const;

  it.each(factoryCalls)(
    "%s returns a SmepError with the expected code",
    (_name, make, expectedCode) => {
      const err = make();
      expect(err).toBeInstanceOf(SmepError);
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe(expectedCode);
      expect(err.name).toBe("SmepError");
      expect(err.message).toEqual(expect.any(String));
      expect(err.message.length).toBeGreaterThan(0);
    }
  );

  it("invalidHarvestWeight embeds the rejected value in its message", () => {
    const err = SmepErrors.invalidHarvestWeight(-42);
    expect(err.message).toContain("-42");
  });

  it("sectorNotFound embeds the sector id in its message", () => {
    const err = SmepErrors.sectorNotFound("north-bed");
    expect(err.message).toContain("north-bed");
  });
});
