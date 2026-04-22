let clipboard = "";

export const getStringAsync = async (): Promise<string> => clipboard;

export const setStringAsync = async (text: string): Promise<boolean> => {
  clipboard = text;
  return true;
};

export const __setClipboard = (value: string): void => {
  clipboard = value;
};
