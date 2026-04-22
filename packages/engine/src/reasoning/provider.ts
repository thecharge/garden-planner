import type { ReasoningContext, ReasoningResult } from "@garden/config";

/** The single, extensible reasoning interface.
 *
 * Consumers accept a ReasoningProvider via dependency injection. They MUST NOT
 * import concrete providers (e.g., anthropicProvider) directly — see the
 * reasoning-provider spec, Requirement 1.
 */
export type ReasoningProvider = {
  readonly id: string;
  readonly ask: (prompt: string, context: ReasoningContext) => Promise<ReasoningResult>;
};

export type ReasoningRouterInput = {
  readonly active: string;
  readonly providers: ReadonlyArray<ReasoningProvider>;
};

export type ReasoningRouter = {
  readonly active: string;
  readonly ask: ReasoningProvider["ask"];
};

import { SmepErrors } from "@garden/config";

/** Pick the active provider from a registry. Returns an object that delegates
 * `ask` to the active provider without exposing the registry. */
export const createReasoningRouter = (input: ReasoningRouterInput): ReasoningRouter => {
  const provider = input.providers.find((p) => p.id === input.active);
  if (!provider) {
    throw SmepErrors.invalidProviderConfig(`No provider registered with id "${input.active}"`);
  }
  return {
    active: provider.id,
    ask: provider.ask
  };
};
