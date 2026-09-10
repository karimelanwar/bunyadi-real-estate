export default function SupportIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 1 1 16 0v4.5a1.5 1.5 0 0 1-1.5 1.5H17v-5h3M4 16.5V12h3v5H5.5A1.5 1.5 0 0 1 4 15.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18v.5a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}
