import { SmepError } from "@garden/config";
import { anthropicProvider, createReasoningRouter } from "../index";
import type { AnthropicClientLike } from "../reasoning/anthropic-provider";

const createHandler =
  (text: string) => async (args: { messages: ReadonlyArray<{ content: string }> }) => ({
    content: [{ type: "text", text: `${text}:${args.messages[0]!.content}` }],
    usage: { input_tokens: 5, output_tokens: 7 }
  });

const mockClient = (text: string): AnthropicClientLike => ({
  messages: { create: createHandler(text) }
});

describe("anthropicProvider", () => {
  it("happy call returns provider id and text", async () => {
    const provider = anthropicProvider({ client: mockClient("reply") });
    const result = await provider.ask("hello", { maxTokens: 64 });
    expect(result.providerId).toBe("anthropic");
    expect(result.text).toBe("reply:hello");
    expect(result.usage).toEqual({ inputTokens: 5, outputTokens: 7 });
  });

  it("null client throws providerNotConfigured", async () => {
    const provider = anthropicProvider({ client: null });
    await expect(provider.ask("hello", {})).rejects.toBeInstanceOf(SmepError);
  });
});

describe("createReasoningRouter", () => {
  it("dispatches to the active provider", async () => {
    const primary = anthropicProvider({ client: mockClient("primary") });
    const router = createReasoningRouter({ active: "anthropic", providers: [primary] });
    const result = await router.ask("ping", {});
    expect(result.text).toBe("primary:ping");
    expect(router.active).toBe("anthropic");
  });

  it("unknown active id throws", () => {
    const primary = anthropicProvider({ client: null });
    expect(() => createReasoningRouter({ active: "nope", providers: [primary] })).toThrow(
      SmepError
    );
  });
});
