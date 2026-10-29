export default function EmptyState({ title, body, action }) {
  return (
    <div className="glass mx-auto max-w-lg rounded-3xl px-8 py-12 text-center">
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-mist">{body}</p>
      {action}
    </div>
  );
}
