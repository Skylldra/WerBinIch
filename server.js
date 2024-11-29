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

io.on('connection', (socket) => {
  socket.on('addPlayer', (name) => {
    if (!players.includes(name)) {
      players.push(name);
      io.emit('updatePlayerList', players);
    }
  });

  socket.on('startGame', () => {
    if (players.length < 2) return;
    gameStarted = true;
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    players.forEach((player, index) => {
      assignments[player] = shuffled[index + 1] || shuffled[0];
    });
    io.emit('gameStarted', { assignments, players });
  });

  socket.on('nextTurn', () => {
    io.emit('nextTurn');
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});
