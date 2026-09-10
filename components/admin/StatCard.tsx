export default function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-card ${
        accent ? "border-brand-600 bg-brand-600 text-white" : "border-brand-100 bg-white"
      }`}
    >
      <p className={`text-sm font-medium ${accent ? "text-brand-100" : "text-brand-600"}`}>
        {label}
      </p>
      <p className={`mt-2 text-3xl font-extrabold ${accent ? "text-white" : "text-brand-950"}`}>
        {value}
      </p>
    </div>
  );
}
