import { useState } from "react";

const TMDB_URL = /^(https:\/\/image\.tmdb\.org\/t\/p\/)[^/]+\//;

/**
 * Ask TMDB for a smaller rendition of an image.
 * Posters: w185 / w342 / w500 / w780. Backdrops: w300 / w780 / w1280.
 */
export function resizeTmdb(url, size) {
  return size && url ? url.replace(TMDB_URL, `$1${size}/`) : url;
}

/**
 * Image that never shows a broken-image icon.
 * Tries: resized src -> original src -> fallbackSrc -> styled placeholder.
 */
export default function Poster({ src, fallbackSrc, alt = "", title, size, className = "", eager = false }) {
  const chain = [...new Set([resizeTmdb(src, size), src, fallbackSrc].filter(Boolean))];
  const key = chain.join("|");
  const [state, setState] = useState({ key, index: 0 });
  const index = state.key === key ? state.index : 0; // start over when the sources change
  const current = chain[index];

  if (!current) {
    return (
      <div
        role="img"
        aria-label={alt || title || "Image unavailable"}
        className={`grid aspect-[2/3] place-items-center bg-gradient-to-br from-panel to-ink p-3 text-center ${className}`}
      >
        {title ? <span className="font-display text-sm leading-snug text-white/55">{title}</span> : null}
      </div>
    );
  }

  return (
    <img
      key={current}
      src={current}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setState({ key, index: index + 1 })}
      className={`bg-white/5 ${className}`}
    />
  );
}