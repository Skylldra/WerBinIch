const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let gameStarted = false;

app.use(express.static(__dirname));

io.on("connection", (socket) => {
    console.log("Ein Nutzer hat sich verbunden");

    socket.on("add-player", (name) => {
        if (!gameStarted && !players.includes(name)) {
            players.push(name);
            io.emit("update-players", players);
        }
    });

    socket.on("start-game", () => {
        if (!gameStarted && players.length > 1) {
            gameStarted = true;
            io.emit("game-started");
        }
    });

    socket.on("end-game", () => {
        if (gameStarted) {
            players = [];
            gameStarted = false;
            io.emit("game-ended");
        }
    });

    socket.on("disconnect", () => {
        console.log("Ein Nutzer hat die Verbindung getrennt");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));