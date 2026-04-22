export const ButtonMode = {
  Primary: "primary",
  Secondary: "secondary",
  Text: "text"
} as const;
export type ButtonMode = (typeof ButtonMode)[keyof typeof ButtonMode];
