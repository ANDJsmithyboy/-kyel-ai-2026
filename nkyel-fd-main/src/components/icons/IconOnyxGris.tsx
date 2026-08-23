export function IconOnyxGris({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Perroquet gris du Gabon de profil — langage, intelligence */}
      <path d="M15 4c-2.5 0-4.5 1.5-5 4-.3 1.5-1 3-3 4v2.5h3l1.5 5.5h2l1-3.5c1.5.2 3 .5 5-1V8c0-2.5-2-4-4.5-4z" />
      <circle cx="14" cy="7.5" r="0.75" fill="currentColor" stroke="none" />
      <path d="M9 10c-.5.5-1.5 1-2 1" />
      <path d="M16 13.5c-1-.5-2.5-.5-3.5 0" />
    </svg>
  );
}
