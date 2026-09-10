export default function BuildingsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v15M13 21v-9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9h1M7 12h1M7 15h1M16 13h1M16 16h1M4 21h16" />
    </svg>
  );
}
