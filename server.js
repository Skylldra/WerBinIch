const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("Ein Nutzer hat sich verbunden");

    socket.on("add-player", (name) => {
        if (!players.includes(name)) { // Spieler darf nur einmal hinzugefügt werden
            players.push(name);
            io.emit("update-players", players); // Aktualisiere die Liste für alle
        }
    });

    socket.on("disconnect", () => {
        console.log("Ein Nutzer hat die Verbindung getrennt");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
