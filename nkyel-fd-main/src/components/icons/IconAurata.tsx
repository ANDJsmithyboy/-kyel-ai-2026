export function IconAurata({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Chat assis de profil — vitesse, légèreté */}
      <path d="M4 11c0-4 2.5-7 4-7s1.5 2.5 1.5 2.5" />
      <path d="M20 11c0-4-2.5-7-4-7s-1.5 2.5-1.5 2.5" />
      <path d="M5 11c0 5 3.134 9 7 9s7-4 7-9" />
      <circle cx="9.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <path d="M10.5 15.5s.7.5 1.5.5 1.5-.5 1.5-.5" />
      <path d="M12 16v1.5" />
    </svg>
  );
}
