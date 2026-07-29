import { tailwindColors } from "./colors";
import { fontFamily, tailwindFontSize } from "./typography";
import { borderRadius, boxShadow, maxWidth } from "./spacing";

export * from "./colors";
export * from "./typography";
export * from "./spacing";

/** tailwind.config.ts 의 theme.extend 로 그대로 펼쳐진다 */
export const tailwindExtend = {
  colors: tailwindColors,
  fontFamily,
  fontSize: tailwindFontSize,
  borderRadius,
  boxShadow,
  maxWidth,
};
