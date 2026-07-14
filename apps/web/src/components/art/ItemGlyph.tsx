import type { ReactElement } from "react";
import type { ItemType } from "@kingdom/db";

const glyphs: Record<ItemType, ReactElement> = {
  WEAPON: (
    <g>
      <path d="M14 4 L20 4 L20 10 L11 19" />
      <path d="M4 15 L9 20" />
      <path d="M6.5 17.5 L3 21" />
      <path d="M9 15 L11 17" />
    </g>
  ),
  SHIELD: (
    <g>
      <path d="M12 3 L20 6 V12 C20 17 16.5 20 12 21.5 C7.5 20 4 17 4 12 V6 Z" />
      <path d="M12 7 V17" />
      <path d="M7.5 10.5 H16.5" />
    </g>
  ),
  HELMET: (
    <g>
      <path d="M5 12 A7 7 0 0 1 19 12 V17 H16 V14 H14 V17 H10 V14 H8 V17 H5 Z" />
      <path d="M12 6 V11" />
    </g>
  ),
  ARMOR: (
    <g>
      <path d="M8 4 L12 6 L16 4 L20 7 L18 11 V19 A2 2 0 0 1 16 21 H8 A2 2 0 0 1 6 19 V11 L4 7 Z" />
      <path d="M12 6 V21" />
    </g>
  ),
  PANTS: (
    <g>
      <path d="M7 3 H17 L18 21 H13 L12 10 L11 21 H6 Z" />
    </g>
  ),
  GLOVES: (
    <g>
      <path d="M7 21 V11 C7 6 9 4 12 4 C15 4 17 6 17 11 V21 Z" />
      <path d="M10 4 V9 M14 4 V9" />
    </g>
  ),
  BOOTS: (
    <g>
      <path d="M9 3 H13 V13 L19 17 V21 H7 A2 2 0 0 1 5 19 V13 A6 6 0 0 0 9 8 Z" />
    </g>
  ),
  RING: (
    <g>
      <circle cx="12" cy="14" r="6.5" />
      <path d="M9.5 8.5 L12 3 L14.5 8.5" />
      <circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" />
    </g>
  ),
  MATERIAL: (
    <g>
      <path d="M12 3 L20 9 L17 20 H7 L4 9 Z" />
      <path d="M4 9 H20 M12 3 V20 M8.5 9 L7 20 M15.5 9 L17 20" />
    </g>
  ),
  CONSUMABLE: (
    <g>
      <path d="M10 3 H14 V7 L17 13 C18 16 16 21 12 21 C8 21 6 16 7 13 L10 7 Z" />
      <path d="M8.2 13 H15.8" />
      <path d="M9 3 H15" />
    </g>
  ),
};

export function ItemGlyph({ type, size = 24 }: { type: ItemType; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {glyphs[type]}
    </svg>
  );
}
