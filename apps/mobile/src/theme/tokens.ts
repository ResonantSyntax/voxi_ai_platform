import raw from '@voxi/theme/tokens.json';

// Thin typed wrapper around packages/theme/tokens.json — the single source
// of truth per DESIGN.md. Never hand-copy hex values; add a mapper here
// instead when RN needs a shape CSS doesn't (e.g. numeric line-height).

export const color = raw.color;

export const font = {
  sans: 'System', // -apple-system / Roboto both resolve to the OS system font in RN
  mono: raw.font.mono,
};

type TypeToken = keyof typeof raw.type;

export function textStyle(token: TypeToken) {
  const t = raw.type[token];
  return {
    fontSize: t.size,
    lineHeight: t.line,
    fontWeight: String(t.weight) as
      | '400'
      | '500'
      | '600'
      | '700',
    letterSpacing: t.tracking,
    ...('transform' in t && t.transform === 'uppercase'
      ? { textTransform: 'uppercase' as const }
      : {}),
  };
}

export const radius = raw.radius;
export const space = raw.space;
export const patterns = raw.patterns;

// Phone-only floor per DESIGN.md's Layout section — desktop drops to 32.
export const HIT_TARGET = 48; // 44px iOS HIG / 48dp Android floor, both satisfied
export const TAIL_SPACER = 150; // every scrolling list under the bottom nav
