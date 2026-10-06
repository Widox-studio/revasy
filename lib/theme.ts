export type AccentColor = "teal" | "pink" | "peach" | "lavender" | "ochre" | "mint";

export interface AccentTheme {
  key: AccentColor;
  name: string;
  bar: string;
  badge: string;
  cardSelected: string;
  bullet: string;
  bulletSelectedText: string;
  text: string;
  border: string;
  ring: string;
  activeButton: string;
  chipDot: string;
  lightBg: string;
}

export const ACCENT_THEMES: Record<AccentColor, AccentTheme> = {
  teal: {
    key: "teal",
    name: "Teal",
    bar: "bg-brand-teal",
    badge: "bg-brand-teal/15 text-brand-teal border-brand-teal/30",
    cardSelected: "bg-white border-brand-teal shadow-card ring-2 ring-brand-teal/20",
    bullet: "border-brand-teal bg-brand-teal text-white",
    bulletSelectedText: "text-brand-teal font-semibold",
    text: "text-brand-teal",
    border: "border-brand-teal",
    ring: "focus:ring-brand-teal",
    activeButton: "bg-brand-teal text-white",
    chipDot: "text-brand-teal",
    lightBg: "bg-brand-teal/10",
  },
  pink: {
    key: "pink",
    name: "Pink",
    bar: "bg-brand-pink",
    badge: "bg-brand-pink/15 text-brand-pink border-brand-pink/30",
    cardSelected: "bg-white border-brand-pink shadow-card ring-2 ring-brand-pink/20",
    bullet: "border-brand-pink bg-brand-pink text-white",
    bulletSelectedText: "text-brand-pink font-semibold",
    text: "text-brand-pink",
    border: "border-brand-pink",
    ring: "focus:ring-brand-pink",
    activeButton: "bg-brand-pink text-white",
    chipDot: "text-brand-pink",
    lightBg: "bg-brand-pink/10",
  },
  peach: {
    key: "peach",
    name: "Peach",
    bar: "bg-brand-peach",
    badge: "bg-brand-peach/25 text-amber-900 border-brand-peach/40",
    cardSelected: "bg-white border-brand-peach shadow-card ring-2 ring-brand-peach/30",
    bullet: "border-brand-peach bg-brand-peach text-ink",
    bulletSelectedText: "text-amber-900 font-semibold",
    text: "text-amber-900",
    border: "border-brand-peach",
    ring: "focus:ring-brand-peach",
    activeButton: "bg-brand-peach text-ink",
    chipDot: "text-amber-700",
    lightBg: "bg-brand-peach/15",
  },
  mint: {
    key: "mint",
    name: "Mint",
    bar: "bg-brand-mint",
    badge: "bg-brand-mint/25 text-emerald-900 border-brand-mint/40",
    cardSelected: "bg-white border-brand-mint shadow-card ring-2 ring-brand-mint/30",
    bullet: "border-brand-mint bg-brand-mint text-ink",
    bulletSelectedText: "text-emerald-900 font-semibold",
    text: "text-emerald-800",
    border: "border-brand-mint",
    ring: "focus:ring-brand-mint",
    activeButton: "bg-brand-mint text-ink",
    chipDot: "text-emerald-700",
    lightBg: "bg-brand-mint/15",
  },
  lavender: {
    key: "lavender",
    name: "Lavender",
    bar: "bg-brand-lavender",
    badge: "bg-brand-lavender/25 text-purple-900 border-brand-lavender/40",
    cardSelected: "bg-white border-brand-lavender shadow-card ring-2 ring-brand-lavender/30",
    bullet: "border-brand-lavender bg-brand-lavender text-ink",
    bulletSelectedText: "text-purple-900 font-semibold",
    text: "text-purple-900",
    border: "border-brand-lavender",
    ring: "focus:ring-brand-lavender",
    activeButton: "bg-brand-lavender text-ink",
    chipDot: "text-purple-700",
    lightBg: "bg-brand-lavender/15",
  },
  ochre: {
    key: "ochre",
    name: "Ochre",
    bar: "bg-brand-ochre",
    badge: "bg-brand-ochre/25 text-amber-900 border-brand-ochre/40",
    cardSelected: "bg-white border-brand-ochre shadow-card ring-2 ring-brand-ochre/30",
    bullet: "border-brand-ochre bg-brand-ochre text-ink",
    bulletSelectedText: "text-amber-900 font-semibold",
    text: "text-amber-900",
    border: "border-brand-ochre",
    ring: "focus:ring-brand-ochre",
    activeButton: "bg-brand-ochre text-ink",
    chipDot: "text-amber-700",
    lightBg: "bg-brand-ochre/15",
  },
};

export function getAccentTheme(color?: string | null): AccentTheme {
  if (color && color in ACCENT_THEMES) {
    return ACCENT_THEMES[color as AccentColor];
  }
  return ACCENT_THEMES.teal;
}
