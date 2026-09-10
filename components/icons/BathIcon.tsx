export default function BathIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12V6a2 2 0 0 1 3.5-1.3M4 19v1M18 19v1" />
    </svg>
  );
}
