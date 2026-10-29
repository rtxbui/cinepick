export default function Loader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-crimson" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 w-40 shrink-0 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  );
}
