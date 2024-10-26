import React, { useState, useEffect } from "react";
import "./App.css";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState("friend"); // "friend" or "AI"
  const [level, setLevel] = useState("easy"); // "easy", "medium", "impossible"
  const [score, setScore] = useState({ X: 0, O: 0 }); // Score for X and O
  const winner = calculateWinner(board);
  const isBoardFull = board.every((square) => square !== null); // Check if board is full

  const handleClick = (index) => {
    if (board[index] || winner) return; // Jika posisi sudah terisi atau ada pemenang, jangan lakukan apa-apa
    const newBoard = board.slice();
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const renderSquare = (index) => {
    return (
      <button className="square" onClick={() => handleClick(index)}>
        {board[index]}
      </button>
    );
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  useEffect(() => {
    if (mode === "AI" && !isXNext && !winner) {
      // Pastikan bahwa AI hanya bergerak jika tidak ada pemenang
      const aiMove = getAiMove(board, level);
      if (aiMove !== null) {
        setTimeout(() => handleClick(aiMove), 500); // Menambahkan delay untuk gerakan AI
      }
    }
    // Jika ada pemenang, update skor
    if (winner) {
      const player = winner === "X" ? "X" : "O";
      setScore((prevScore) => ({
        ...prevScore,
        [player]: prevScore[player] + 1,
      }));
    }
  }, [isXNext, mode, board, level, winner]);

  const getAiMove = (board, level) => {
    if (level === "impossible") {
      return minimax(board, "O").index; // AI menggunakan algoritma minimax
    }
    // For easy and medium difficulty
    const availableMoves = board
      .map((value, index) => (value === null ? index : null))
      .filter((index) => index !== null);

    if (level === "easy") {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Random move
    }

    // For medium, AI will try to block the player or win if possible
    const winningMove = findWinningMove(board, "O");
    if (winningMove !== null) return winningMove;

    const blockingMove = findWinningMove(board, "X");
    if (blockingMove !== null) return blockingMove;

    return availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Random move
  };

  const findWinningMove = (board, player) => {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const newBoard = board.slice();
        newBoard[i] = player;
        if (calculateWinner(newBoard) === player) {
          return i;
        }
      }
    }
    return null;
  };

  const minimax = (board, player) => {
    const winner = calculateWinner(board);
    if (winner === "O") return { score: 1 }; // AI win
    if (winner === "X") return { score: -1 }; // Player win
    if (board.every((square) => square !== null)) return { score: 0 }; // Draw

    const moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const newBoard = board.slice();
        newBoard[i] = player;

        const result = minimax(newBoard, player === "O" ? "X" : "O");
        moves.push({ index: i, score: result.score });
      }
    }

    let bestMove;
    if (player === "O") {
      let bestScore = -Infinity;
      for (const move of moves) {
        if (move.score > bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      }
    } else {
      let bestScore = Infinity;
      for (const move of moves) {
        if (move.score < bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      }
    }

    return bestMove;
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
    resetGame();
  };

  const handleLevelChange = (event) => {
    setLevel(event.target.value);
    resetGame();
  };

  const renderStatus = () => {
    if (winner) {
      if (mode === "friend") {
        return `Pemenang: ${
          winner === "X" ? "Orang 1" : "Orang 2"
        } (${winner})`;
      }
      return `Pemenang: ${winner}`;
    }
    if (isBoardFull) {
      return "Seri";
    }
    return `Giliran: ${isXNext ? "X" : "O"}`;
  };

  return (
    <div className="game">
      <div className="status">{renderStatus()}</div>
      <div className="score">
        Skor: X - {score.X} | O - {score.O}
      </div>
      <div className="mode-selection">
        <label>
          <input
            type="radio"
            value="friend"
            checked={mode === "friend"}
            onChange={handleModeChange}
          />
          Teman
        </label>
        <label>
          <input
            type="radio"
            value="AI"
            checked={mode === "AI"}
            onChange={handleModeChange}
          />
          AI
        </label>
      </div>
      {mode === "AI" && (
        <div className="level-selection">
          <label>
            <input
              type="radio"
              value="easy"
              checked={level === "easy"}
              onChange={handleLevelChange}
            />
            Mudah
          </label>
          <label>
            <input
              type="radio"
              value="medium"
              checked={level === "medium"}
              onChange={handleLevelChange}
            />
            Sedang
          </label>
          <label>
            <input
              type="radio"
              value="impossible"
              checked={level === "impossible"}
              onChange={handleLevelChange}
            />
            Mustahil
          </label>
        </div>
      )}
      <div className="board">
        {Array(3)
          .fill(null)
          .map((_, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {Array(3)
                .fill(null)
                .map((_, colIndex) => renderSquare(rowIndex * 3 + colIndex))}
            </div>
          ))}
      </div>
      <button className="reset-button" onClick={resetGame}>
        Mulai Ulang
      </button>
    </div>
  );
};

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const App = () => {
  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      <TicTacToe />
    </div>
  );
};

export default App;
