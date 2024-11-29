const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let assignments = {};
let submittedWords = {};

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname)));

// Route für die Indexseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Hilfsfunktion für zufällige Zuweisung
function assignPlayers(players) {
  const shuffled = [...players];
  const assignments = {};

  let attempts = 0;
  do {
    attempts++;
    shuffled.sort(() => Math.random() - 0.5);

    // Prüfen, ob kein Spieler sich selbst zugewiesen wird
    let valid = true;
    for (let i = 0; i < players.length; i++) {
      if (players[i] === shuffled[i]) {
        valid = false;
        break;
      }
    }

    if (valid) {
      players.forEach((player, index) => {
        assignments[player] = shuffled[index];
      });
      return assignments;
    }
  } while (attempts < 100);

  throw new Error('Konnte keine gültige Zuordnung erstellen!');
}

// Socket.IO-Verbindungen
io.on('connection', (socket) => {
  console.log('Ein Spieler hat sich verbunden:', socket.id);

  // Spieler hinzufügen
  socket.on('addPlayer', (name) => {
    if (!players.includes(name)) {
      players.push(name);
      io.emit('updatePlayerList', players);
    }
  });

  // Spiel starten
  socket.on('startGame', () => {
    if (players.length < 2) return;

    try {
      assignments = assignPlayers(players);
      submittedWords = {};
      const currentPlayer = players[0]; // Erster Spieler beginnt
      io.emit('gameStarted', { assignments, currentPlayer });
    } catch (error) {
      console.error(error.message);
    }
  });

  // Wort einreichen
  socket.on('submitWord', ({ player, word }) => {
    submittedWords[player] = word;

    if (Object.keys(submittedWords).length === players.length) {
      io.emit('allWordsSubmitted', submittedWords);
    }
  });

  // Spiel zurücksetzen
  socket.on('resetGame', () => {
    players = [];
    assignments = {};
    submittedWords = {};
    io.emit('updatePlayerList', players);
  });

  socket.on('disconnect', () => {
    console.log('Ein Spieler hat die Verbindung getrennt:', socket.id);
  });
});

// Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
