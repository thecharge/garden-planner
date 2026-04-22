import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { settingsStore } from "@/features/settings";

const KEY_NAME = "anthropic_api_key";
const PREFIX_LEN = 7;
const SUFFIX_LEN = 4;
const MIN_MASKABLE = PREFIX_LEN + SUFFIX_LEN;

const keyQueryKey = ["anthropic-key"] as const;

const maskKey = (plain: string): string => {
  if (plain.length < MIN_MASKABLE) {
    return "***…***";
  }
  return `${plain.slice(0, PREFIX_LEN)}***…***${plain.slice(-SUFFIX_LEN)}`;
};

export type AnthropicKeyState = {
  readonly keyMasked: string | null;
  readonly hasKey: boolean;
  readonly saveKey: (plain: string) => Promise<void>;
  readonly clearKey: () => Promise<void>;
  readonly isLoading: boolean;
};

export const useAnthropicKey = (): AnthropicKeyState => {
  const qc = useQueryClient();
  const query = useQuery<string | null>({
    queryKey: keyQueryKey,
    queryFn: async () => {
      const stored = await SecureStore.getItemAsync(KEY_NAME);
      return stored ?? null;
    }
  });

  const save = useMutation<void, Error, string>({
    mutationFn: async (plain) => {
      await SecureStore.setItemAsync(KEY_NAME, plain);
      settingsStore.getState().setAnthropicKeyConfigured(true);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keyQueryKey });
    }
  });

  const clear = useMutation<void, Error, void>({
    mutationFn: async () => {
      await SecureStore.deleteItemAsync(KEY_NAME);
      settingsStore.getState().setAnthropicKeyConfigured(false);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keyQueryKey });
    }
  });

  const plain = query.data ?? null;
  return {
    keyMasked: plain ? maskKey(plain) : null,
    hasKey: Boolean(plain),
    saveKey: async (p) => {
      await save.mutateAsync(p);
    },
    clearKey: async () => {
      await clear.mutateAsync();
    },
    isLoading: query.isLoading || save.isPending || clear.isPending
  };
};
