export type DesignToken = {
  id: string
  cssVar?: string
  hex?: string
  role: string
}

/** Closed design-system class set — every id must appear on /landing. */
export const DESIGN_TOKENS: DesignToken[] = [
  {
    id: "ds-bg-abyss",
    cssVar: "--ds-abyss",
    hex: "#1B2632",
    role: "Page canvas",
  },
  {
    id: "ds-bg-surface",
    cssVar: "--ds-blue-fantastic",
    hex: "#2C3B4D",
    role: "Elevated surface",
  },
  {
    id: "ds-bg-flame",
    cssVar: "--ds-burning-flame",
    hex: "#FFB162",
    role: "Primary accent fill",
  },
  {
    id: "ds-bg-truffle",
    cssVar: "--ds-truffle",
    hex: "#A35139",
    role: "Secondary accent fill",
  },
  {
    id: "ds-bg-palladian",
    cssVar: "--ds-palladian",
    hex: "#EEE9DF",
    role: "Light fill / swatch",
  },
  {
    id: "ds-bg-oatmeal",
    cssVar: "--ds-oatmeal",
    hex: "#C9C1B1",
    role: "Soft fill / swatch",
  },
  {
    id: "ds-text-primary",
    cssVar: "--ds-palladian",
    hex: "#EEE9DF",
    role: "Primary text",
  },
  {
    id: "ds-text-muted",
    cssVar: "--ds-oatmeal",
    hex: "#C9C1B1",
    role: "Muted text",
  },
  {
    id: "ds-text-flame",
    cssVar: "--ds-burning-flame",
    hex: "#FFB162",
    role: "Accent text",
  },
  {
    id: "ds-text-on-light",
    cssVar: "--ds-abyss",
    hex: "#1B2632",
    role: "Text on light fills",
  },
  {
    id: "ds-border-oatmeal",
    cssVar: "--ds-oatmeal",
    hex: "#C9C1B1",
    role: "Soft border",
  },
  {
    id: "ds-font-display",
    role: "Editorial display type (Fraunces)",
  },
  {
    id: "ds-font-body",
    role: "Body type (Geist)",
  },
  {
    id: "ds-font-mono",
    role: "Mono type (Geist Mono)",
  },
  {
    id: "ds-hero",
    role: "Hero composition shell",
  },
  {
    id: "ds-glow",
    role: "Cinematic flame ember",
  },
  {
    id: "ds-panel",
    role: "Quiet content panel",
  },
  {
    id: "ds-cta",
    role: "Primary call to action",
  },
  {
    id: "ds-link",
    role: "Text link / secondary action",
  },
  {
    id: "ds-eyebrow",
    role: "Mono section label — the brand's voice",
  },
  {
    id: "ds-rule",
    role: "Hairline divider — an orbit seen edge-on",
  },
  {
    id: "ds-scrim",
    role: "Gradient that keeps type legible over the canvas",
  },
  {
    id: "ds-corner",
    role: "Bracket mark for one corner — an instrument bezel",
  },
  {
    id: "ds-ticks",
    role: "Measure ticks along an edge — the orbit's dots, flattened",
  },
  {
    id: "ds-horizon",
    role: "Drifting warm gradient that closes the page",
  },
  {
    id: "ds-bracket",
    role: "Framed mark — [ sun · orbit · sun ], used once",
  },
  {
    id: "ds-orbit-corner",
    role: "An orbit arc as a corner, curved where ds-corner is square",
  },
  {
    id: "ds-border-danger",
    role: "The one red border — the delete confirmation, and nowhere else",
  },
  {
    id: "ds-text-danger",
    role: "Validation and destructive actions — 7.51:1 where red-600 was 3.76",
  },
  {
    id: "ds-collapse",
    role: "A section leaving — height animated without anyone measuring it",
  },
  {
    id: "ds-navbar",
    role: "The app's own bar — filled, because everything the page owns is not",
  },
  {
    id: "ds-badge",
    role: "Unread dot — the one place alarm means attention rather than error",
  },
  {
    id: "ds-segment",
    role: "Two readings of one screen — the selected option is raised, not coloured",
  },
  {
    id: "ds-swatch",
    role: "A colour choice — flame ring on an abyss offset, so it reads as chosen",
  },
  {
    id: "ds-tabbar",
    role: "The phone's bottom bar — glued down, content running beneath it",
  },
  {
    id: "ds-check",
    role: "Checkbox and radio — accent-color, so the native contract survives",
  },
  {
    id: "ds-field",
    role: "An input — recessed where a card is raised, so it reads as type here",
  },
  {
    id: "ds-or",
    role: "The rule either side of a choice between two ways in",
  },
  {
    id: "ds-card",
    role: "A region raised off the abyss — the container a screen groups into",
  },
  {
    id: "ds-centre-short",
    role: "Centres a screen that does not fill the viewport, ignores one that does",
  },
  {
    id: "ds-container",
    role: "The measure a screen's content is set in",
  },
  {
    id: "ds-app",
    role: "The app's inherited base — abyss, palladian, 14px body",
  },
  {
    id: "ds-type-note",
    role: "Timestamps, helper text, footers",
  },
  {
    id: "ds-type-label",
    role: "A control's label — medium, because a target is not a heading",
  },
  {
    id: "ds-type-title",
    role: "The screen's h1",
  },
  {
    id: "ds-type-heading",
    role: "A section h2 inside a screen",
  },
  {
    id: "ds-type-metric",
    role: "A number that changes — tabular, so it cannot shift its neighbours",
  },
  {
    id: "ds-phase",
    role: "Toggleable phase disc — eclipse to full, one member's day",
  },
]

export const DESIGN_TOKEN_IDS = DESIGN_TOKENS.map((token) => token.id)

export const getDesignToken = (id: string) =>
  DESIGN_TOKENS.find((token) => token.id === id)
