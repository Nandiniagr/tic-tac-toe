import React, { useState, useCallback } from "react";
import "./App.css";

const App = () => {
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningSequence, setWinningSequence] = useState([]);

  const checkWinner = (newBoard) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinner(newBoard[a]);
        setWinningSequence(pattern);
        return newBoard[a]; // Return winner
      }
    }

    return null; // No winner
  };

  const handleClick = useCallback(async (index) => {
    if (board[index] || winner) return; // Prevent moves if game is over

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      return; // stop bot move if player wins
    }

    setIsPlayerTurn(false);

    if (!newBoard.includes(null)) return; //Stop if no empty spaces left

    const response = await fetch("https://hiring-react-assignment.vercel.app/api/bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBoard),
    });

    const botMove = await response.json();
    if (botMove !== null) {
      newBoard[botMove] = playerSymbol === "X" ? "O" : "X";
      setBoard(newBoard);

      const botWinner = checkWinner(newBoard);
      if (botWinner) {
        setWinner(botWinner);
        return; //stop further moves if bot wins
      }
    }

    setIsPlayerTurn(true);
  }, [board, playerSymbol, winner]);

  return (
    <div className="game">
      {!playerSymbol ? (
        <div className="symbol-selection">
          <h2>Choose Your Player</h2>
          <button onClick={() => setPlayerSymbol("X")}>X</button>
          <button onClick={() => setPlayerSymbol("O")}>O</button>
        </div>
      ) : (
        <>
          <h1>Tic Tac Toe</h1>
          <div className="board">
            {board.map((value, index) => (
              <button
                key={index}
                className={`square ${winningSequence.includes(index) ? "highlight" : ""}`}
                onClick={() => handleClick(index)}
                disabled={value !== null || winner !== null} // Disable if game is over
              >
                {value}
              </button>
            ))}
          </div>
          {winner && <h2>{winner} Wins!</h2>}
        </>
      )}
    </div>
  );
};

export default App;
