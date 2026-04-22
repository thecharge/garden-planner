import { ANTHROPIC_MODEL_ID, FontFamily } from "@garden/config";
import { ThemeId } from "@garden/ui";
import { LogLevel } from "@/core/log-level";

/** The single source of truth for every app runtime constant.
 *
 * Components and hooks MUST import from here; magic-number/string literals in
 * feature code fail lint. Cross-package enums and shared types live in
 * @garden/config — these two files are complementary, not overlapping.
 */
export const config = {
  /** Capture window (ms) during which sensor samples are collected into a Protocol. */
  CAPTURE_WINDOW_MS: 3000,
  /** Minimum scan confidence below which a re-scan warning is surfaced. */
  CONFIDENCE_MIN: 0.5,
  /** Throttle threshold (degrees) for pose-consuming React components. */
  POSE_THROTTLE_DEG: 1.0,
  /** Throttle threshold (metres) for pose-consuming React components. */
  POSE_THROTTLE_METERS: 0.1,

  /** How long a caption persists on screen (ms) after a TTS whisper. */
  CAPTION_TTL_MS: 5000,
  /** TTS playback rate (1.0 = default). */
  TTS_RATE: 1.0,
  /** STT confidence threshold below which input is rejected as low-confidence. */
  STT_CONFIDENCE_MIN: 0.6,
  /** STT timeout (ms) before prompting the user to retry. */
  STT_TIMEOUT_MS: 8000,
  /** TTS cancellation deadline (ms) once a new STT utterance begins. */
  TTS_CANCEL_DEADLINE_MS: 200,

  /** TanStack Query defaults. */
  QUERY_STALE_TIME_MS: 30_000,
  QUERY_GC_TIME_MS: 5 * 60_000,
  QUERY_RETRY: 1,
  QUERY_REFETCH_ON_WINDOW_FOCUS: false,

  /** Logger level. Debug < Info < Warn < Error < Silent. */
  LOG_LEVEL: LogLevel.Info as LogLevel,

  /** Default Anthropic model id, re-exported from @garden/config so features
   * reference a single name. Upgrading the model is a one-line edit to the
   * @garden/config constant.
   */
  ANTHROPIC_MODEL_ID,

  /** Default theme and font. Overridden by the settings store once loaded. */
  DEFAULT_THEME: ThemeId.LightPastel as ThemeId,
  DEFAULT_FONT: FontFamily.Lexend as FontFamily,

  /** Minimum boundary corners required before distanceToPropertyLine is computed. */
  MIN_BOUNDARY_CORNERS: 3,
  /** Announcement debounce window (ms) — prevents repeated spatial a11y calls. */
  A11Y_ANNOUNCE_DEBOUNCE_MS: 1000,

  /** Feature flags. */
  featureFlags: {
    enableSkiaHeatmap: true,
    enableReanimatedOverlay: true,
    enableVoiceLoop: true
  }
} as const;

export type AppConfig = typeof config;
