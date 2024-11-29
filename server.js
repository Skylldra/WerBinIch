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

    assignments = {};
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    players.forEach((player, index) => {
      assignments[player] = shuffled[(index + 1) % players.length];
    });

    submittedWords = {};
    io.emit('gameStarted', { assignments, currentPlayer: socket.id });
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
