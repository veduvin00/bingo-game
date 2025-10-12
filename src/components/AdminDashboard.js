// File: src/components/AdminDashboard.jsx
import { useState, useEffect } from "react";
import ChangePassword from "./ChangePassword";

const API_BASE = "http://localhost:5001";

export default function AdminDashboard({ admin, onLogout }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard`);
      const data = await res.json();
      
      if (res.ok) {
        setLeaderboard(data);
      } else {
        setError("Failed to fetch leaderboard");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🎯 Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome, {admin.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchLeaderboard}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                🔄 Refresh
              </button>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🏆 Leaderboard - Bingo Winners
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="mt-4 text-blue-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No winners yet! 🎲
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Winners will appear here once they complete a bingo
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Player Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Completed At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => (
                    <tr
                      key={player._id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                        index === 0 ? "bg-yellow-50" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0
                              ? "bg-yellow-400 text-yellow-900"
                              : index === 1
                              ? "bg-gray-300 text-gray-700"
                              : index === 2
                              ? "bg-orange-300 text-orange-900"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-800">
                          {player.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(player.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats */}
          {leaderboard.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">
                  {leaderboard.length}
                </span>{" "}
                {leaderboard.length === 1 ? "player has" : "players have"} completed bingo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}