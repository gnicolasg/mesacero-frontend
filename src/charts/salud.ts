export function estadoSalud(score: number) {
  if (score >= 75) return { badge: "Óptimo", color: "var(--good)" };
  if (score >= 50) return { badge: "Mejorable", color: "var(--warning)" };
  return { badge: "En riesgo", color: "var(--critical)" };
}
