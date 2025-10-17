import { useState, useEffect } from "react";
import ChangePassword from "./ChangePassword";

const API_BASE = "http://localhost:5001";

export default function AdminDashboard({ admin, onLogout }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [previousWinnerIds, setPreviousWinnerIds] = useState([]);
  const [newWinnerName, setNewWinnerName] = useState(null);
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [playerToReset, setPlayerToReset] = useState(null);
  const [viewingPlayerData, setViewingPlayerData] = useState(null); // store full player info

  // Play victory sound
  const playVictorySound = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => console.log("Audio play failed:", err));
    } catch (err) {
      console.log("Could not play sound:", err);
    }
  };

  // Fetch leaderboard — only on load or refresh, no interval
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
        const currentWinnerIds = data.map((p) => p._id);
        const newWinners = data.filter((p) => !previousWinnerIds.includes(p._id));
        if (newWinners.length > 0) {
          playVictorySound();
          setNewWinnerName(newWinners[0].name);
          setTimeout(() => setNewWinnerName(null), 5000);
        }
        setPreviousWinnerIds(currentWinnerIds);
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

  // Fetch player board when viewing
  const fetchPlayerBoard = async (playerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/player/${playerId}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error fetching player data");
      setViewingPlayerData(data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch player board.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Reset a player's board
  const resetPlayerBoard = async (playerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reset-player/${playerId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Player ${data.name}'s board has been reset.`);
        setPreviousWinnerIds((prev) => prev.filter((id) => id !== playerId));
        fetchLeaderboard();
        setViewingPlayer(null);
        setViewingPlayerData(null);
      } else {
        alert("Failed to reset player board");
      }
    } catch (err) {
      console.error(err);
      alert("Error resetting player board");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 -100 p-8">
      <div className="max-w-4xl mx-auto">

        {/* New Winner Notification */}
        {newWinnerName && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce z-50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <div className="font-bold text-lg">New Winner!</div>
                <div className="text-sm">{newWinnerName} got BINGO!</div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🎯 Admin Dashboard</h1>
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
              onClick={() => setShowChangePassword(true)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              🔑 Change Password
            </button>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Leaderboard - Bingo Winners</h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading leaderboard...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button onClick={fetchLeaderboard} className="mt-4 text-blue-500 hover:underline">
                Try again
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No winners yet! 🎲</p>
              <p className="text-sm mt-2">Winners will appear here once they complete a bingo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Player Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Completed At</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
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
                      <td className="py-4 px-4 font-medium text-gray-800">{player.name}</td>
                      <td className="py-4 px-4 text-gray-600">{formatDate(player.completedAt)}</td>
                      <td className="py-4 px-4 flex gap-2">
                        <button
                          onClick={() => {
                            setViewingPlayer(player);
                            fetchPlayerBoard(player._id);
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          View Board
                        </button>
                        <button
                          onClick={() => setPlayerToReset(player)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          userId={admin.adminId}
          userName={admin.name}
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => alert("Password changed successfully!")}
        />
      )}

      {/* View Board Modal */}
      {viewingPlayer && viewingPlayerData && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 w-full max-w-3xl overflow-auto">
      <h3 className="text-xl font-bold mb-4">{viewingPlayerData.name}'s Board</h3>

      {/* Reconstruct board with FREE at index 12 */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {(() => {
          const FREE_SPACE_INDEX = 12;
          const fullBoard = viewingPlayerData.board.length === 24
            ? [
                ...viewingPlayerData.board.slice(0, FREE_SPACE_INDEX),
                "FREE",
                ...viewingPlayerData.board.slice(FREE_SPACE_INDEX)
              ]
            : viewingPlayerData.board;

          return fullBoard.map((text, idx) => {
            const signed = viewingPlayerData.signatures[idx] || "";
            const isFreeSpace = idx === FREE_SPACE_INDEX;

            const baseClasses =
              "p-2 border text-center rounded text-sm sm:text-base flex flex-col items-center justify-center";
            const signedClasses = signed && !isFreeSpace ? "bg-green-200 font-semibold" : "";
            const freeSpaceClasses = isFreeSpace ? "bg-yellow-300 font-bold" : "";
            const emptyClasses = !text && !isFreeSpace ? "bg-gray-100" : "";

            return (
              <div key={idx} className={`${baseClasses} ${signedClasses} ${freeSpaceClasses} ${emptyClasses}`}>
                {isFreeSpace ? "⭐ FREE SPACE" : text || "—"}
                {signed && !isFreeSpace && (
                  <span className="text-xs mt-1 italic opacity-80 truncate w-full">— {signed}</span>
                )}
              </div>
            );
          });
        })()}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setViewingPlayer(null);
            setViewingPlayerData(null);
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Close
        </button>
        <button
          onClick={() => setPlayerToReset(viewingPlayer)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          ❌ Remove / Reset
        </button>
      </div>
    </div>
  </div>
)}


      {/* Confirm Reset Modal */}
      {playerToReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Confirm Reset</h3>
            <p className="mb-6">
              Are you sure you want to reset <span className="font-semibold">{playerToReset.name}</span>'s board?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPlayerToReset(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetPlayerBoard(playerToReset._id);
                  setPlayerToReset(null);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
