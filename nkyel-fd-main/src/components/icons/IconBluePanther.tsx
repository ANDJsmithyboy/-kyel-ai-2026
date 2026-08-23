export function IconBluePanther({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Panthère low-poly 6 facettes — puissance, mode créateur */}
      <path d="M4 6l4 3h8l4-3" />
      <path d="M8 9l-1 5 5 6 5-6-1-5" />
      <path d="M12 20V9" />
      <path d="M7 14l5-5 5 5" />
      <circle cx="9.5" cy="11" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
