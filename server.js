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

// Hilfsfunktion für zufällige und gültige Zuweisung
function assignPlayers(players) {
  const shuffled = [...players];
  let valid = false;
  let assignments = {};

  // Versuche, eine gültige Zuordnung zu erstellen
  while (!valid) {
    shuffled.sort(() => Math.random() - 0.5); // Spielerliste zufällig mischen
    valid = true;

    // Prüfen, ob kein Spieler sich selbst zugewiesen wird
    players.forEach((player, index) => {
      if (player === shuffled[index]) {
        valid = false;
      }
    });

    // Wenn gültig, Zuweisungen erstellen
    if (valid) {
      players.forEach((player, index) => {
        assignments[player] = shuffled[index];
      });
    }
  }

  return assignments;
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

    assignments = assignPlayers(players);
    submittedWords = {};
    const currentPlayer = players[0]; // Erster Spieler beginnt
    io.emit('gameStarted', { assignments, currentPlayer });
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
