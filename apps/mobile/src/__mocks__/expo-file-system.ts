export const cacheDirectory = "file:///mock/cache/";

export const writeAsStringAsync = jest.fn(async (_uri: string, _content: string) => undefined);
export const readAsStringAsync = jest.fn(async (_uri: string) => "");
export const deleteAsync = jest.fn(async (_uri: string) => undefined);
export const getInfoAsync = jest.fn(async (_uri: string) => ({ exists: true, isDirectory: false }));
