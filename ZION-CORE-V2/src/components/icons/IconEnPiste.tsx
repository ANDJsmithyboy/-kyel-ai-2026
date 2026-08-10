/**
 * Gaboma AI · IconEnPiste — Deux pas de panthère 🐾🐾
 * SmartANDJ AI Technologies
 * Icône "En Piste" — deux empreintes de pattes en diagonale (bien visibles)
 */

export function IconEnPiste({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Patte 1 (haut-droite) — coussinets + paume */}
      <ellipse cx="15" cy="10" rx="2.8" ry="2.1" />
      <ellipse cx="11.5" cy="7.2" rx="1.1" ry="1.4" transform="rotate(-12 11.5 7.2)" />
      <ellipse cx="14" cy="5.8" rx="1.1" ry="1.3" />
      <ellipse cx="16.5" cy="5.8" rx="1.1" ry="1.3" />
      <ellipse cx="18.8" cy="7.2" rx="1.1" ry="1.4" transform="rotate(12 18.8 7.2)" />

      {/* Patte 2 (bas-gauche) — coussinets + paume */}
      <ellipse cx="9" cy="18" rx="2.8" ry="2.1" />
      <ellipse cx="5.5" cy="15.2" rx="1.1" ry="1.4" transform="rotate(-12 5.5 15.2)" />
      <ellipse cx="8" cy="13.8" rx="1.1" ry="1.3" />
      <ellipse cx="10.5" cy="13.8" rx="1.1" ry="1.3" />
      <ellipse cx="12.8" cy="15.2" rx="1.1" ry="1.4" transform="rotate(12 12.8 15.2)" />
    </svg>
  );
}
