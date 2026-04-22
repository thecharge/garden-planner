import { useMutation } from "@tanstack/react-query";
import { actionRequired } from "@garden/core";
import type { ReasoningProvider } from "@garden/engine";
import type { Summary } from "@garden/config";
import { config } from "@/core/config";
import { createLogger } from "@/core/logger";

const log = createLogger("voice");

export type VoiceIntent = {
  readonly transcript: string;
  readonly sttConfidence: number;
};

/** useVoiceLoop — take an STT intent, optionally route to the reasoning provider,
 * return a Summary the UI announces. Low-confidence STT never reaches the provider.
 */
export const useVoiceLoop = (provider: ReasoningProvider | null) =>
  useMutation<Summary, Error, VoiceIntent>({
    mutationFn: async (intent) => {
      if (intent.sttConfidence < config.STT_CONFIDENCE_MIN) {
        log.info("low-confidence STT discarded");
        return actionRequired("I didn't catch that — say it again or tap to type.");
      }
      if (!provider) {
        return actionRequired("Add your Anthropic key in settings to continue.");
      }
      const result = await provider.ask(intent.transcript, {
        maxTokens: 256,
        systemHint:
          "You are a brief, plain-language garden-planning assistant. One short sentence per reply. No jargon."
      });
      return {
        type: "success",
        message: result.text,
        meta: { providerId: result.providerId }
      };
    }
  });
