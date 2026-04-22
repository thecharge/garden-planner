import { config } from "@/core/config";
import { LogLevel } from "@/core/log-level";

export { LogLevel };
export type EmittedLevel = Exclude<LogLevel, typeof LogLevel.Silent>;

const LEVEL_DEBUG = 10;
const LEVEL_INFO = 20;
const LEVEL_WARN = 30;
const LEVEL_ERROR = 40;
const LEVEL_SILENT = 100;

const levelRank: Readonly<Record<LogLevel, number>> = {
  [LogLevel.Debug]: LEVEL_DEBUG,
  [LogLevel.Info]: LEVEL_INFO,
  [LogLevel.Warn]: LEVEL_WARN,
  [LogLevel.Error]: LEVEL_ERROR,
  [LogLevel.Silent]: LEVEL_SILENT
};

export type LogRecord = {
  readonly tag: string;
  readonly level: EmittedLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly data?: ReadonlyArray<unknown>;
};

export type Transport = (record: LogRecord) => void;

let activeTransport: Transport = (record) => {
  const line = `[${record.timestamp}] ${record.level.toUpperCase()} ${record.tag}: ${record.message}`;
  if (record.level === LogLevel.Error) {
    console.error(line, ...(record.data ?? []));
    return;
  }
  if (record.level === LogLevel.Warn) {
    console.warn(line, ...(record.data ?? []));
    return;
  }
  console.log(line, ...(record.data ?? []));
};

export const setTransport = (transport: Transport): void => {
  activeTransport = transport;
};

export type Logger = {
  readonly debug: (message: string, ...data: ReadonlyArray<unknown>) => void;
  readonly info: (message: string, ...data: ReadonlyArray<unknown>) => void;
  readonly warn: (message: string, ...data: ReadonlyArray<unknown>) => void;
  readonly error: (message: string, ...data: ReadonlyArray<unknown>) => void;
};

const emit = (
  tag: string,
  level: EmittedLevel,
  message: string,
  data: ReadonlyArray<unknown>
): void => {
  if (levelRank[level] < levelRank[config.LOG_LEVEL]) {
    return;
  }
  activeTransport({
    tag,
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data.length === 0 ? {} : { data })
  });
};

export const createLogger = (tag: string): Logger => ({
  debug: (message, ...data) => emit(tag, LogLevel.Debug, message, data),
  info: (message, ...data) => emit(tag, LogLevel.Info, message, data),
  warn: (message, ...data) => emit(tag, LogLevel.Warn, message, data),
  error: (message, ...data) => emit(tag, LogLevel.Error, message, data)
});
