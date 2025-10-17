// File: src/components/AdminLogin.jsx
import { useState } from "react";

const API_BASE = process.env.REACT_APP_BINGO_API;

export default function AdminLogin({ onAdminLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onAdminLogin(data);
      } else {
        setError(data.error || "Invalid admin credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server. Make sure backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 text-sm mt-2">
            Access the leaderboard dashboard
          </p>
        </div>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full border rounded-md px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full border rounded-md px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Not an admin?{" "}
            <a href="/" className="text-purple-600 hover:underline font-semibold">
              Player Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}