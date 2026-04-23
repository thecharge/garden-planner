type SpeakOptions = {
  readonly rate?: number;
  readonly language?: string;
  readonly onDone?: () => void;
  readonly onStopped?: () => void;
  readonly onError?: (e: unknown) => void;
};

export const speak = jest.fn((_text: string, options?: SpeakOptions) => {
  if (options?.onDone) {
    queueMicrotask(options.onDone);
  }
});

export const stop = jest.fn();

export const getAvailableVoicesAsync = jest.fn(async () => []);
