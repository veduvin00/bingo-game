// File: src/components/BingoCard.jsx
import { useState } from "react";
import Confetti from "react-confetti";
import ChangePassword from "./ChangePassword";

const API_BASE = "http://localhost:5001";

export default function BingoCard({ player, board, initialSignatures, onLogout }) {
  const [signatures, setSignatures] = useState(initialSignatures);
  const [bingo, setBingo] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Handle cell click
  const handleCellClick = (index) => {
    // Don't allow editing if bingo is achieved
    if (bingo) {
      alert("🎉 Bingo achieved! Board is locked. Reset to play again.");
      return;
    }
    
    setActiveIndex(index);
    setInputValue(signatures[index]);
  };

  // Submit signature
  const handleSignatureSubmit = async () => {
    if (!inputValue.trim()) return;

    // Check if name already exists in another cell
    const nameExists = signatures.some((sig, idx) => 
      idx !== activeIndex && sig.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (nameExists) {
      alert("This name is already used in another cell!");
      return;
    }

    const newSignatures = [...signatures];
    newSignatures[activeIndex] = inputValue.trim();
    setSignatures(newSignatures);
    setActiveIndex(null);
    setInputValue("");
    checkBingo(newSignatures);

    // Send update to backend
    try {
      await fetch(`${API_BASE}/api/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.id,
          signatures: newSignatures,
        }),
      });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // Remove signature (undo)
  const handleRemoveSignature = async (index) => {
    if (bingo) {
      alert("🎉 Bingo achieved! Board is locked. Reset to play again.");
      return;
    }

    const newSignatures = [...signatures];
    newSignatures[index] = "";
    setSignatures(newSignatures);
    setBingo(false); // Reset bingo if removing a signature

    // Update backend
    try {
      await fetch(`${API_BASE}/api/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.id,
          signatures: newSignatures,
        }),
      });
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  // Check for bingo
  const checkBingo = (signatures) => {
    const marked = signatures.map((s) => s !== "");
    const lines = [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20],
    ];
    const isBingo = lines.some((line) => line.every((i) => marked[i]));
    setBingo(isBingo);
  };

  // Reset board
  const resetBoard = async () => {
    const newSignatures = Array(25).fill("");
    setSignatures(newSignatures);
    setBingo(false);

    // Update backend
    try {
      await fetch(`${API_BASE}/api/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.id,
          signatures: newSignatures,
        }),
      });
    } catch (err) {
      console.error("Reset failed", err);
    }
  };

  // Debug: Log board length
  console.log("Board length:", board.length);
  console.log("Board items:", board);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 to-pink-100 p-4">
      {bingo && <Confetti />}

      {/* Header with welcome and logout */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-gray-800">
          🎯 Welcome, {player.name}!
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChangePassword(true)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm"
          >
            🔑 Change Password
          </button>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={resetBoard}
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        🔄 Reset Board
      </button>

      {/* Bingo grid */}
      <div className="grid grid-cols-5 gap-2 w-full max-w-3xl">
        {board.map((text, i) => (
          <div
            key={i}
            onClick={() => handleCellClick(i)}
            className={`relative flex flex-col items-center justify-center text-center p-4 rounded-2xl text-sm cursor-pointer select-none transition-all min-h-[100px]
              ${
                bingo
                  ? signatures[i]
                    ? "bg-green-300 text-white opacity-75 cursor-not-allowed"
                    : "bg-gray-200 text-gray-500 opacity-75 cursor-not-allowed"
                  : signatures[i]
                  ? "bg-green-400 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}
          >
            <span className="font-medium">{text}</span>
            {signatures[i] && (
              <>
                <span className="mt-2 text-xs italic opacity-80">
                  — {signatures[i]}
                </span>
                {!bingo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSignature(i);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                    title="Remove signature"
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Bingo celebration message */}
      {bingo && (
        <div className="mt-6 text-center">
          <div className="text-2xl font-semibold text-green-600 animate-bounce mb-2">
            🎉 You got a Bingo!
          </div>
          <p className="text-gray-600 text-sm">
            Your board is now locked. Click "Reset Board" to play again.
          </p>
        </div>
      )}

      {/* Modal for adding signature */}
      {activeIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-80">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Who matches this?
            </h2>
            <p className="text-sm mb-3 text-gray-600 font-medium">
              {board[activeIndex]}
            </p>
            <input
              type="text"
              placeholder="Enter their name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSignatureSubmit()}
              autoFocus
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setActiveIndex(null);
                  setInputValue("");
                }}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              {signatures[activeIndex] && (
                <button
                  onClick={() => {
                    handleRemoveSignature(activeIndex);
                    setActiveIndex(null);
                    setInputValue("");
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Remove
                </button>
              )}
              <button
                onClick={handleSignatureSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                Sign ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          userId={player.id}
          userName={player.name}
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => alert("Password changed successfully!")}
        />
      )}
    </div>
  );
}