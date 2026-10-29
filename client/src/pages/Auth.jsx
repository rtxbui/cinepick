import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isLogin = useLocation().pathname === "/login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the API. You can keep using demo mode from Home.");
    }
  };

  return (
    <main className="grid min-h-[80vh] place-items-center px-4">
      <form onSubmit={onSubmit} className="glass w-full max-w-md space-y-4 rounded-3xl p-8">
        <h1 className="font-display text-4xl">{isLogin ? "Welcome back" : "Create your CinePick"}</h1>
        {!isLogin ? (
          <input
            required
            placeholder="Name"
            className="w-full rounded-xl bg-black/30 p-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        ) : null}
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full rounded-xl bg-black/30 p-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full rounded-xl bg-black/30 p-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error ? <p className="text-sm text-crimson">{error}</p> : null}
        <button className="w-full rounded-full bg-crimson py-3 font-medium">{isLogin ? "Sign in" : "Register"}</button>
        <p className="text-center text-sm text-mist">
          {isLogin ? (
            <Link to="/register">Need an account?</Link>
          ) : (
            <Link to="/login">Already have one?</Link>
          )}
        </p>
      </form>
    </main>
  );
}
