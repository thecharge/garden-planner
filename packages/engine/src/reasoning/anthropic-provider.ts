import { ANTHROPIC_MODEL_ID, SmepErrors } from "@garden/config";
import type { ReasoningContext, ReasoningResult } from "@garden/config";
import type { ReasoningProvider } from "./provider";

export const MessageRole = {
  User: "user",
  Assistant: "assistant"
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

export const ContentBlockType = {
  Text: "text"
} as const;
export type ContentBlockType = (typeof ContentBlockType)[keyof typeof ContentBlockType];

const DEFAULT_MAX_TOKENS = 512;

/** Minimal Anthropic-SDK surface we depend on. Defined inline (not imported)
 * so @garden/engine stays consumable without forcing @anthropic-ai/sdk to be a
 * hard dep for non-reasoning consumers. The mobile app passes a real SDK client
 * when building the provider.
 */
export type AnthropicClientLike = {
  messages: {
    create: (args: {
      model: string;
      max_tokens: number;
      temperature?: number;
      system?: string;
      messages: ReadonlyArray<{ role: MessageRole; content: string }>;
    }) => Promise<{
      content: ReadonlyArray<{ type: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    }>;
  };
};

export type AnthropicProviderInput = {
  readonly client: AnthropicClientLike | null;
  readonly modelId?: string;
};

const textFromContent = (content: ReadonlyArray<{ type: string; text?: string }>): string => {
  for (const block of content) {
    if (block.type === ContentBlockType.Text && block.text) {
      return block.text;
    }
  }
  return "";
};

const PROVIDER_ID = "anthropic";

/** Build the Anthropic provider. A null client means "no key configured" —
 * calls will throw SmepErrors.providerNotConfigured rather than attempting network.
 */
export const anthropicProvider = (input: AnthropicProviderInput): ReasoningProvider => ({
  id: PROVIDER_ID,
  ask: async (prompt: string, context: ReasoningContext): Promise<ReasoningResult> => {
    if (!input.client) {
      throw SmepErrors.providerNotConfigured();
    }
    const result = await input.client.messages.create({
      model: input.modelId ?? ANTHROPIC_MODEL_ID,
      max_tokens: context.maxTokens ?? DEFAULT_MAX_TOKENS,
      ...(context.temperature === undefined ? {} : { temperature: context.temperature }),
      ...(context.systemHint === undefined ? {} : { system: context.systemHint }),
      messages: [{ role: MessageRole.User, content: prompt }]
    });
    return {
      providerId: PROVIDER_ID,
      text: textFromContent(result.content),
      ...(result.usage === undefined
        ? {}
        : {
            usage: {
              inputTokens: result.usage.input_tokens ?? 0,
              outputTokens: result.usage.output_tokens ?? 0
            }
          })
    };
  }
});
