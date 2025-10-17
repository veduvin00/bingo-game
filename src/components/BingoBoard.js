// File: src/components/BingoCard.jsx
import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import ChangePassword from "./ChangePassword";

const API_BASE = "http://localhost:5001";
const FREE_SPACE_INDEX = 12; // Center square (index 12 in 0-24 grid)

export default function BingoCard({ player, board, initialSignatures, onLogout }) {
  // Ensure board is always 25 squares
  const fullBoard = board.length === 24 ? [...board.slice(0, 12), "FREE", ...board.slice(12)] : board;

  const [signatures, setSignatures] = useState(() => {
    // If initialSignatures is missing free space, insert placeholder
    const sig = initialSignatures || Array(25).fill("");
    sig[FREE_SPACE_INDEX] = "FREE";
    return sig;
  });
  const [bingo, setBingo] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [frozen, setFrozen] = useState(false); // Board frozen after bingo

  useEffect(() => {
  const savedSignatures = localStorage.getItem(`signatures_${player.id}`);
  if (savedSignatures) {
    setSignatures(JSON.parse(savedSignatures));
  }
}, [player.id]);

  // Handle cell click
  const handleCellClick = (index) => {
    if (index === FREE_SPACE_INDEX || bingo || frozen) return;
    setActiveIndex(index);
    setInputValue(signatures[index] || "");
  };

  // Submit signature
  const handleSignatureSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Prevent duplicate globally
    if (signatures.some((s, idx) => idx !== activeIndex && s.toLowerCase() === trimmed.toLowerCase())) {
      alert("This name is already used in another cell!");
      return;
    }

    const newSignatures = [...signatures];
    newSignatures[activeIndex] = trimmed;
    setSignatures(newSignatures);
    localStorage.setItem(`signatures_${player.id}`, JSON.stringify(newSignatures));
    setActiveIndex(null);
    setInputValue("");

    const bingoAchieved = checkBingo(newSignatures);
    if (bingoAchieved) setFrozen(true);

    // Send update to backend
    try {
      await fetch(`${API_BASE}/api/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, signatures: newSignatures }),
      });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // Remove signature
  const handleRemoveSignature = async (index) => {
    if (index === FREE_SPACE_INDEX || bingo || frozen) return;

    const newSignatures = [...signatures];
    newSignatures[index] = "";
    setSignatures(newSignatures);
    localStorage.setItem(`signatures_${player.id}`, JSON.stringify(newSignatures));

    // Reset bingo if any
    setBingo(false);

    try {
      await fetch(`${API_BASE}/api/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, signatures: newSignatures }),
      });
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  // Check bingo
  const checkBingo = (sigs) => {
    const marked = sigs.map((s, i) => i === FREE_SPACE_INDEX || s !== "");
    const lines = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
    ];
    const isBingo = lines.some(line => line.every(i => marked[i]));
    setBingo(isBingo);
    return isBingo;
  };

  // Reset board
  const resetBoard = async () => {
    const empty = Array(25).fill("");
    empty[FREE_SPACE_INDEX] = "FREE";
    setSignatures(empty);
    setBingo(false);
    setFrozen(false);

    try {
      await fetch(`${API_BASE}/api/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, signatures: empty }),
      });
    } catch (err) {
      console.error("Reset failed", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 p-2 sm:p-4">
      {bingo && <Confetti />}

      {/* Header */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">🎯 Welcome, {player.name}!</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setShowChangePassword(true)} className="bg-gray-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-gray-600 transition text-xs sm:text-sm flex-1 sm:flex-none">
            🔑 <span className="hidden sm:inline">Change Password</span><span className="sm:hidden">Password</span>
          </button>
          <button onClick={onLogout} className="bg-red-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-red-600 transition text-xs sm:text-sm flex-1 sm:flex-none">
            Logout
          </button>
        </div>
      </div>

      <button onClick={resetBoard} className="mb-4 sm:mb-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm sm:text-base">
        🔄 Reset Board
      </button>

      {/* Bingo grid */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-3xl">
        {fullBoard.map((text, i) => {
          const isFree = i === FREE_SPACE_INDEX;
          return (
            <div key={i} onClick={() => handleCellClick(i)}
              className={`relative flex flex-col items-center justify-center text-center p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl text-xs sm:text-sm transition-all min-h-[70px] sm:min-h-[90px] md:min-h-[100px]
                ${isFree ? "bg-yellow-300 text-gray-800 cursor-default font-bold" :
                  bingo || frozen
                  ? signatures[i] ? "bg-green-300 text-white opacity-75 cursor-not-allowed" : "bg-gray-200 text-gray-500 opacity-75 cursor-not-allowed"
                  : signatures[i] ? "bg-green-400 text-white shadow-lg scale-105 cursor-pointer" : "bg-white text-gray-700 hover:bg-blue-100 cursor-pointer"
                } select-none`}>
              {isFree
                ? <div className="flex flex-col items-center"><span className="text-xl sm:text-2xl mb-1">⭐</span><span className="font-bold text-base sm:text-lg">FREE</span><span className="text-xs hidden sm:inline">SPACE</span></div>
                : <>
                    <span className="font-medium leading-tight">{text}</span>
                    {signatures[i] && !isFree && (
                      <>
                        <span className="mt-1 sm:mt-2 text-xs italic opacity-80 truncate w-full px-1">— {signatures[i]}</span>
                        {!bingo && !frozen &&
                          <button onClick={e => { e.stopPropagation(); handleRemoveSignature(i); }}
                            className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                            title="Remove signature">×</button>
                        }
                      </>
                    )}
                  </>
              }
            </div>
          );
        })}
      </div>

      {bingo && (
        <div className="mt-4 sm:mt-6 text-center px-4">
          <div className="text-xl sm:text-2xl font-semibold text-green-600 animate-bounce mb-2">🎉 You got a Bingo!</div>
          <p className="text-gray-600 text-xs sm:text-sm">Your board is now frozen. Admin must reset you to play again.</p>
        </div>
      )}

      {/* Signature modal */}
      {activeIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-xl w-full max-w-sm sm:w-80">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Who matches this?</h2>
            <p className="text-xs sm:text-sm mb-2 sm:mb-3 text-gray-600 font-medium">{fullBoard[activeIndex]}</p>
            <input type="text" placeholder="Enter their name" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSignatureSubmit()}
              autoFocus
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
            <div className="flex justify-between gap-2">
              <button onClick={() => { setActiveIndex(null); setInputValue(""); }} className="px-3 sm:px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition text-sm">Cancel</button>
              {signatures[activeIndex] && (
                <button onClick={() => { handleRemoveSignature(activeIndex); setActiveIndex(null); setInputValue(""); }} className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm">Remove</button>
              )}
              <button onClick={handleSignatureSubmit} className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm">Sign ✅</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password */}
      {showChangePassword && <ChangePassword userId={player.id} userName={player.name} onClose={() => setShowChangePassword(false)} onSuccess={() => alert("Password changed successfully!")} />}
    </div>
  );
}
