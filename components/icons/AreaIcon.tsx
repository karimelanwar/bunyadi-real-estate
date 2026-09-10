export default function AreaIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4ZM14 14h6v6h-6v-6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h6v-4H4v4ZM14 10h6V4h-6v6Z" opacity=".4" />
    </svg>
  );
}
