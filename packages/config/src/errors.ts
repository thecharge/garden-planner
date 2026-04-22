/** SmepError + the SmepErrors factory.
 *
 * This is the single place `new Error(...)` is permitted (via `super(...)`).
 * Every other package throws via `SmepErrors.<method>()`.
 */

export const SmepErrorCode = {
  ProtocolEmpty: "PROTOCOL_EMPTY",
  CaptureTooShort: "CAPTURE_TOO_SHORT",
  ProviderNotConfigured: "PROVIDER_NOT_CONFIGURED",
  RepositoryUnavailable: "REPOSITORY_UNAVAILABLE",
  InvalidProviderConfig: "INVALID_PROVIDER_CONFIG",
  InsufficientSoilData: "INSUFFICIENT_SOIL_DATA",
  SectorNotFound: "SECTOR_NOT_FOUND",
  UnsupportedClimateZone: "UNSUPPORTED_CLIMATE_ZONE",
  InvalidHarvestWeight: "INVALID_HARVEST_WEIGHT"
} as const;
export type SmepErrorCode = (typeof SmepErrorCode)[keyof typeof SmepErrorCode];

export class SmepError extends Error {
  readonly code: SmepErrorCode;

  constructor(code: SmepErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "SmepError";
  }
}

export const SmepErrors = {
  protocolEmpty: (): SmepError =>
    new SmepError(SmepErrorCode.ProtocolEmpty, "Protocol is missing required data."),

  captureTooShort: (): SmepError =>
    new SmepError(SmepErrorCode.CaptureTooShort, "Capture window is below the minimum duration."),

  providerNotConfigured: (): SmepError =>
    new SmepError(
      SmepErrorCode.ProviderNotConfigured,
      "No reasoning provider key is configured. Add your Anthropic key in settings."
    ),

  repositoryUnavailable: (): SmepError =>
    new SmepError(
      SmepErrorCode.RepositoryUnavailable,
      "Local memory repository could not be opened."
    ),

  invalidProviderConfig: (reason: string): SmepError =>
    new SmepError(
      SmepErrorCode.InvalidProviderConfig,
      `Reasoning provider config is invalid: ${reason}`
    ),

  insufficientSoilData: (): SmepError =>
    new SmepError(
      SmepErrorCode.InsufficientSoilData,
      "Not enough soil-sample data to produce a diagnosis. Record a soil sample."
    ),

  sectorNotFound: (sectorId: string): SmepError =>
    new SmepError(SmepErrorCode.SectorNotFound, `Sector not found: ${sectorId}`),

  unsupportedClimateZone: (zone: string): SmepError =>
    new SmepError(SmepErrorCode.UnsupportedClimateZone, `Climate zone not supported: ${zone}`),

  invalidHarvestWeight: (weight: unknown): SmepError =>
    new SmepError(
      SmepErrorCode.InvalidHarvestWeight,
      `Harvest weight must be a positive finite number, got: ${String(weight)}`
    )
} as const;
