import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask me for a mood, a reference title, or something like “a movie like Interstellar but more emotional”.",
    },
  ]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    const res = await api.chat(text, user);
    setMessages((m) => [
      ...m,
      { role: "assistant", text: res.reply, movies: res.movies },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="glass mb-3 flex h-[420px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-medium">CinePick assistant</p>
            <button onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <p className={`inline-block rounded-2xl px-3 py-2 ${m.role === "user" ? "bg-crimson" : "bg-white/8"}`}>
                  {m.text}
                </p>
                {m.movies?.length ? (
                  <div className="mt-2 space-y-1 text-left text-xs text-mist">
                    {m.movies.map((movie) => (
                      <Link key={movie.id} to={`/movie/${movie.id}`} className="block hover:text-white">
                        {movie.title} · {movie.year}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-full bg-white/5 px-3 py-2 text-sm outline-none"
              placeholder="Describe a movie craving..."
            />
            <button className="grid h-9 w-9 place-items-center rounded-full bg-crimson">
              <Send size={14} />
            </button>
          </form>
        </div>
      ) : null}
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-crimson shadow-[0_12px_40px_rgba(229,9,20,0.45)]"
      >
        <MessageCircle />
      </button>
    </div>
  );
}
