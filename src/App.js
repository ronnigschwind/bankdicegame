import React, { useState } from "react";
import "./index.css"; // Use index.css

function App() {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [totalScores, setTotalScores] = useState([]);
  const [rollCount, setRollCount] = useState(0);
  const [bankedPlayers, setBankedPlayers] = useState(new Set()); // Keep track of players who banked
  const [roundEnded, setRoundEnded] = useState(false); // Track if round has ended

  // Function to save player names to localStorage
  // const savePlayerNames = (playerNames) => {
  //   localStorage.setItem('playerNames', JSON.stringify(playerNames));
  // };

  // Add a new player
  const addPlayer = () => {
    if (newPlayerName.trim() === "") return;
    setPlayers([...players, newPlayerName]);
    setTotalScores([...totalScores, 0]);
    setNewPlayerName("");
    // savePlayerNames(players);
  };

  // Start the game
  const startGame = () => {
    if (players.length > 1) {
      setGameStarted(true);
    } else {
      alert("You need at least 2 players to start.");
    }
  };

  // Switch to the next player after each roll
  const switchTurn = () => {
    let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    // Find the next player who hasn't banked
    while (bankedPlayers.has(players[nextPlayerIndex])) {
      nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
      if (nextPlayerIndex === currentPlayerIndex) {
        return;
      }
    }

    setCurrentPlayerIndex(nextPlayerIndex); // Switch to the next player
  };

  // Roll the dice (either digital or manual input)
  const rollDice = (customSum = null) => {
    let rollSum;
    if (customSum !== null) {
      rollSum = customSum;
    } else {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      rollSum = die1 + die2;
    }

    const newRollCount = rollCount + 1;
    setRollCount(newRollCount);

    // If the player rolls a 7, end the round
    if (rollSum === 7) {
      alert(`${players[currentPlayerIndex]} rolled a 7! Round over.`);
      setRoundEnded(true);
      return;
    }

    switchTurn();

    // Add the score to the player's turn score
    setRoundScore((prevRoundScore) => prevRoundScore + rollSum);
  };

  // Bank the current round score and add to total score
  const bankPoints = () => {
    const updatedScores = [...totalScores];
    updatedScores[currentPlayerIndex] += roundScore; // Add round score to total score
    setTotalScores(updatedScores);

    setBankedPlayers((prev) => new Set(prev).add(players[currentPlayerIndex])); // Mark this player as banked
    switchTurn(); // Switch turns immediately after banking
  };

  // Restart the game
  const restartGame = () => {
    setPlayers([]);
    setTotalScores([]);
    setRoundScore(0);
    setGameStarted(false);
    setCurrentPlayerIndex(0);
    setRollCount(0);
    setBankedPlayers(new Set());
    setRoundEnded(false);
  };

  // Check if the round is over
  const isRoundOver = () => {
    // Round ends if all players have banked or if someone rolled a 7
    return bankedPlayers.size === players.length || roundEnded;
  };

  return (
    <div className="App">
      <h1>BANK! Dice Game</h1>

      {!gameStarted ? (
        <div className="player-setup">
          <h3>Add Players</h3>
          <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Enter player name"/>
          <button onClick={addPlayer}>Add Player</button>

          {players.length > 0 && (
            <div>
              <h3>Players:</h3>
                {players.map((player, index) => (
                  <p key={index}>{player}</p>
                ))}
              <button onClick={startGame}>Start Game</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Current Player: {players[currentPlayerIndex]}</h2>
          <h3>Roll Count: {rollCount}</h3>
          <h3>Round Score: {roundScore}</h3>

          <button onClick={() => rollDice()}>Roll Dice</button>

          <div>
            <h3>Custom Dice Roll</h3>
            {[...Array(11).keys()].map((num) => (
              <button 
                key={num + 2} 
                onClick={() => rollDice(num + 2)} 
                style={{
                  backgroundColor: rollCount >= 3 && num + 2 === 7 ? 'red' : 'white', 
                  border: '1px solid black', 
                  // cursor: 'pointer'
                  cursor: rollCount >= 3 && (num + 2 === 2 || num + 2 === 12) ? 'default' : 'pointer', // Change cursor to default for 2 and 12 after first roll
                }}
                disabled={rollCount >= 3 && (num + 2 === 2 || num + 2 === 12)} // Disable 2 and 12 after 3rd roll - these would both be doubles
              >
                {num + 2}
              </button>
            ))}
            {/* Only show the "Doubles" button after 3 rolls */}
            {rollCount >= 3 && (
              <button onClick={() => rollDice(roundScore)} style={{backgroundColor: 'white', border: '1px solid black', cursor: 'pointer'}}>DOUBLES!</button>
            )}
          </div>

          <button onClick={bankPoints} disabled={roundScore === 0 || isRoundOver()}>
            Bank Points
          </button>

          {isRoundOver() && <h3>The round is over!</h3>}

          <button onClick={restartGame}>Restart Game</button>

          <h3>All Players' Scores</h3>
            {players.map((player, index) => (
              <p key={index}>
                {player}: {totalScores[index]} points
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

export default App;