const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let assignments = {};
let gameStarted = false;

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname)));

// Standard-Route für die Index-Seite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.IO-Verbindungen
io.on('connection', (socket) => {
  console.log('Ein Spieler hat sich verbunden.');

  // Spieler hinzufügen
  socket.on('addPlayer', (name) => {
    if (!players.includes(name)) {
      players.push(name);
      io.emit('updatePlayerList', players); // Aktualisiere die Liste für alle Clients
    }
  });

  // Spiel starten
  socket.on('startGame', () => {
    if (players.length < 2 || gameStarted) return;
    gameStarted = true;

    // Spieler zuweisen
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    players.forEach((player, index) => {
      assignments[player] = shuffled[index + 1] || shuffled[0];
    });

    io.emit('gameStarted', { assignments, players }); // Spielstatus an alle senden
  });

  // Spieler entfernt (optional)
  socket.on('removePlayer', (name) => {
    players = players.filter((player) => player !== name);
    io.emit('updatePlayerList', players);
  });

  // Nächster Spieler
  socket.on('nextTurn', (currentPlayer) => {
    io.emit('nextTurn', currentPlayer); // Nächster Spielerzug für alle synchronisieren
  });

  socket.on('disconnect', () => {
    console.log('Ein Spieler hat die Verbindung getrennt.');
  });
});

server.listen(3000, () => {
  console.log('Server läuft auf Port 3000');
});
