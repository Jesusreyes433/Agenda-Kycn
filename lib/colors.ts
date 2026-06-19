// Paleta profesional y sobria para distinguir a cada consultor en la agenda.
export const MEMBER_COLOR_PALETTE = [
  "#0F2540", // azul marino
  "#1F6F5C", // verde esmeralda
  "#8A4B2E", // terracota
  "#3B4C9B", // azul índigo
  "#7A2E45", // vino
  "#2E6E8A", // azul petróleo
  "#5C4B8A", // violeta
  "#8A6D1F", // mostaza oscuro
  "#2E7A4F", // verde bosque
  "#8A2E2E", // rojo ladrillo
];

export function nextMemberColor(existingCount: number): string {
  return MEMBER_COLOR_PALETTE[existingCount % MEMBER_COLOR_PALETTE.length];
}
