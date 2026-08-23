export function IconWandana({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Éléphant de face géométrique — mémoire, recherche */}
      <path d="M7 8c-2-.5-4 .5-4 3s1.5 4 3 5l1 4h2l.5-3" />
      <path d="M17 8c2-.5 4 .5 4 3s-1.5 4-3 5l-1 4h-2l-.5-3" />
      <path d="M9.5 17s1 3 2.5 3 2.5-3 2.5-3" />
      <path d="M8 8c0-3 1.8-5 4-5s4 2 4 5" />
      <circle cx="9.5" cy="10" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
