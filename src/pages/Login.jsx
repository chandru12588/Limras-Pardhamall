import React, { useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export default function Login({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpointPath = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const endpoint = `${API_BASE}${endpointPath}`;
      const payload = mode === "register" ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Unable to continue. Please try again.");
        return;
      }

      setMessage(mode === "register" ? "Account created successfully." : "Login successful.");
      onAuthSuccess?.(data);
    } catch {
      setError("Backend is not reachable. Start limras-backend with: npm run start");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-8 mb-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Access</h1>
      <p className="text-sm text-gray-600 mb-6">
        {mode === "register" ? "Create your account to continue." : "Sign in to your account."}
      </p>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button
          type="submit"
          className="w-full bg-green-700 text-white rounded-lg py-2.5 font-semibold hover:bg-green-800 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "register" ? "Create Account" : "Login"}
        </button>
      </form>

      <button
        className="mt-4 text-sm text-green-700 underline"
        onClick={() => {
          setMode((m) => (m === "login" ? "register" : "login"));
          setError("");
          setMessage("");
        }}
      >
        {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
      </button>
    </section>
  );
}
