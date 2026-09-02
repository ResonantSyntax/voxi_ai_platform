// The Voxi design system. Both UI libraries read this preset — shadcn/ui on
// Next.js and gluestack-ui (NativeWind) on Expo — so the token layer is shared
// even though the components are not. See ADR-0003.
//
// Semantics, not decoration:
//   mint  = Voxi is doing or saying something. Never generic emphasis.
//   lime  = something is finished.
const t = require('./tokens.json')

const px = (n) => `${n}px`

module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: t.color.surface.canvas,
        bg: t.color.surface.bg,
        surface: {
          DEFAULT: t.color.surface.surface,
          2: t.color.surface.surface2,
          3: t.color.surface.surface3,
        },
        line: t.color.line,
        mint: t.color.mint,
        lime: t.color.lime,
        content: t.color.text,
      },
      fontFamily: {
        sans: t.font.sans.split(',').map((s) => s.trim().replace(/^"|"$/g, '')),
        mono: t.font.mono.split(',').map((s) => s.trim().replace(/^"|"$/g, '')),
      },
      fontSize: Object.fromEntries(
        Object.entries(t.type).map(([name, v]) => [
          name,
          [px(v.size), { lineHeight: px(v.line), fontWeight: String(v.weight), letterSpacing: px(v.tracking ?? 0) }],
        ])
      ),
      borderRadius: Object.fromEntries(
        Object.entries(t.radius).map(([name, v]) => [name, px(v)])
      ),
      spacing: Object.fromEntries(t.space.map((v, i) => [String(i + 1), px(v)])),
    },
  },
}
