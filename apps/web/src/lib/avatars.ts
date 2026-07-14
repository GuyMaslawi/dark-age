export type AvatarOption = {
  key: string;
  label: string;
  accent: string;
};

const FALLBACK_AVATAR: AvatarOption = {
  key: "ember",
  label: "גחלת",
  accent: "#c9a227",
};

export const avatarOptions: AvatarOption[] = [
  FALLBACK_AVATAR,
  { key: "crimson", label: "ארגמן", accent: "#8b1e1e" },
  { key: "verdant", label: "אזוב", accent: "#3f7d4f" },
  { key: "azure", label: "תכלת", accent: "#3b6fb3" },
  { key: "violet", label: "סגול", accent: "#7a4fa8" },
  { key: "ash", label: "אפר", accent: "#8a8a8a" },
];

export const DEFAULT_AVATAR_KEY = FALLBACK_AVATAR.key;

export function avatarFor(key: string): AvatarOption {
  return avatarOptions.find((option) => option.key === key) ?? FALLBACK_AVATAR;
}
