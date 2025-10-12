// File: src/App.jsx
import { useState } from "react";
import LoginPage from "./components/LoginPage";
import BingoCard from "./components/BingoBoard";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [player, setPlayer] = useState(null);
  const [board, setBoard] = useState([]);
  const [signatures, setSignatures] = useState(Array(25).fill(""));
  const [admin, setAdmin] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Handle player login
  const handleLogin = (data) => {
    setPlayer({ id: data.playerId, name: data.name });
    setBoard(data.board);
    setSignatures(data.signatures || Array(25).fill(""));
  };

  // Handle player logout
  const handleLogout = () => {
    setPlayer(null);
    setBoard([]);
    setSignatures(Array(25).fill(""));
    setIsAdminMode(false);
  };

  // Handle admin login
  const handleAdminLogin = (data) => {
    setAdmin(data);
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setAdmin(null);
    setIsAdminMode(false);
  };

  // Show admin dashboard if admin is logged in
  if (admin) {
    return <AdminDashboard admin={admin} onLogout={handleAdminLogout} />;
  }

  // Show admin login if in admin mode
  if (isAdminMode) {
    return (
      <div>
        <AdminLogin onAdminLogin={handleAdminLogin} />
        <button
          onClick={() => setIsAdminMode(false)}
          className="fixed bottom-4 left-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm"
        >
          ← Back to Player Login
        </button>
      </div>
    );
  }

  // Show player login if not logged in
  if (!player) {
    return (
      <div>
        <LoginPage onLogin={handleLogin} />
        <button
          onClick={() => setIsAdminMode(true)}
          className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
        >
          Admin Login →
        </button>
      </div>
    );
  }

  // Show Bingo game for logged in player
  return (
    <BingoCard
      player={player}
      board={board}
      initialSignatures={signatures}
      onLogout={handleLogout}
    />
  );
}