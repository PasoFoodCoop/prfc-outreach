const AVATAR_COLORS = [
  "#831002", // paso red
  "#523019", // paso brown
  "#8b5e3c", // tawny
  "#a0522d", // sienna
  "#6b7c5e", // olive
  "#5f7a8a", // slate
  "#9c6b7a", // dusty rose
  "#b06840", // terracotta
] as const;

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return AVATAR_COLORS[0];

  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) | 0;
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
