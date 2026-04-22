/** Minimal persistent chrome — caption banner, settings gear, provider badge.
 *
 * Components live in ./components/ and require the RN runtime. This barrel
 * exists so cross-feature imports always go through an index.ts per the FSD
 * boundary rule.
 */
export const OVERLAY_FEATURE = "overlay" as const;
