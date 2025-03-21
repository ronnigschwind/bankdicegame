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
  // const [bankedPlayers, setBankedPlayers] = useState(new Set()); // Keep track of players who banked
  const [bankedPlayers, setBankedPlayers] = useState([]); // Change from Set to Array
  const [roundEnded, setRoundEnded] = useState(false); // Track if round has ended
  const [roundCount, setRoundCount] = useState(1);
  const [numberOfRounds, setNumberOfRounds] = useState(0);

  // Function to save player names to localStorage
  // const savePlayerNames = (playerNames) => {
  //   localStorage.setItem('playerNames', JSON.stringify(playerNames));
  // };

  // Add a new player
  // currently doesn't handle duplicates
  const addPlayer = () => {
    if (newPlayerName.trim() === "") return;
    setPlayers([...players, newPlayerName]);
    setTotalScores([...totalScores, 0]);
    setNewPlayerName("");
    // savePlayerNames(players);
  };

  // Start the game
  const startGame = () => {
    if (players.length > 1 && numberOfRounds > 0) {
      setGameStarted(true);
    } else {
      alert("You need at least 2 players to start and 1 or more rounds.");
    }
  };

  // Switch to the next player after each roll
  const switchTurn = () => {
    let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    // Find the next player who hasn't banked
    while (bankedPlayers.includes(players[nextPlayerIndex])) {
      nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
      if (nextPlayerIndex === currentPlayerIndex) {
        return;
      }
    }
    // while (bankedPlayers.has(players[nextPlayerIndex])) {
    //   nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    //   if (nextPlayerIndex === currentPlayerIndex) {
    //     return;
    //   }
    // }

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
    if (rollSum === 7 && rollCount < 3) {
      rollSum = 70;
    } else if (rollSum === 7 && rollCount >= 3) {
      alert(`${players[currentPlayerIndex]} rolled a 7! Round over.`);
      setRoundEnded(true);

      // still increment player so next round will start with the next player
      let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextPlayerIndex); 
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

    // setBankedPlayers((prev) => new Set(prev).add(players[currentPlayerIndex])); // Mark this player as banked
    // setBankedPlayers((prev) => [...prev, players[currentPlayerIndex]]); // Store player in array
    // switchTurn(); // Switch turns immediately after banking
    // Add player to banked list
    const newBankedPlayers = [...bankedPlayers, players[currentPlayerIndex]];
    setBankedPlayers(newBankedPlayers);

    // If all players have banked, end the round
    if (newBankedPlayers.length === players.length) {
      setRoundEnded(true);
    } else {
      switchTurn(); // Otherwise, switch turns
    }
  };

  // Restart the game
  const restartGame = () => {
    setPlayers([]);
    setTotalScores([]);
    setRoundScore(0);
    setGameStarted(false);
    setCurrentPlayerIndex(0);
    setRollCount(0);
    setBankedPlayers([]);
    setRoundEnded(false);
    setRoundCount(1);
  };

  // Check if the round is over
  const isRoundOver = () => {
    // Round ends if all players have banked or if someone rolled a 7
    return bankedPlayers.length === players.length || roundEnded;
  };

  const isGameOver = () => {
    // return roundCount >= numberOfRounds;
    return roundCount >= numberOfRounds && isRoundOver();
  };

  const getWinnerIndex = () => {
    return totalScores.indexOf(Math.max(...totalScores));
  };

  const startNextRound = () => {
    // setRollCount(roundCount + 1);
    // setCurrentPlayerIndex(0); // Start with the first player again
    setRollCount(0);
    setRoundScore(0);
    setBankedPlayers([]);
    setRoundEnded(false);
    setRoundCount(roundCount + 1);
  };  

  return (
    <div className="App">
      <h1>BANK! Dice Game</h1>

      {!gameStarted ? (
        <div className="player-setup">

          <h3>Number of Rounds</h3>
          <input type="text" value={numberOfRounds} onChange={(e) => setNumberOfRounds(e.target.value)} placeholder="Enter number of rounds"/>

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
      ) : isGameOver() ? (
         /** FINAL SCORE SCREEN WHEN ALL ROUNDS ARE COMPLETE **/
        <div>
          <h2>Game Over!</h2>
          <h2>Round {roundCount}/{numberOfRounds}</h2>
          <h3>Final Scores:</h3>
          {players.map((player, index) => (
            <p key={index}>{player}: {totalScores[index]} points</p>
          ))}

          <h2>Winner: {players[getWinnerIndex()]}</h2>
          <button onClick={restartGame}>Restart Game</button>
        </div>
      ) : isRoundOver() ? (
        /** ROUND OVER SCREEN **/
        <div>
          <h2>Round {roundCount} Complete!</h2>
          <h3>Scores so far:</h3>
          {players.map((player, index) => (
            <p key={index}>{player}: {totalScores[index]} points</p>
          ))}
          
          {/* {roundCount < numberOfRounds ? (
            <button onClick={startNextRound}>Start Next Round</button>
          ) : (
            <button onClick={() => setGameOver(true)}>See Final Scores</button>
          )} */}
          {roundCount < numberOfRounds ? (
            <button onClick={startNextRound}>Start Next Round</button>
          ) : (
            <button onClick={() => setRoundCount(numberOfRounds)}>See Final Scores</button>
          )}

        </div>
      ) : (
        /** MAIN GAME SCREEN **/
        <div>
          <h2>Round {roundCount}/{numberOfRounds}</h2>
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

          {/* {isRoundOver() && <h3>The round is over!</h3>} */}

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