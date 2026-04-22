/** The context passed into a ReasoningProvider call. Kept small and provider-agnostic. */
export type ReasoningContext = {
  readonly systemHint?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
};

/** The result returned from a ReasoningProvider call. */
export type ReasoningResult = {
  readonly providerId: string;
  readonly text: string;
  readonly usage?: {
    readonly inputTokens: number;
    readonly outputTokens: number;
  };
};
