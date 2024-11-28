const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];

app.use(express.static(__dirname)); // Statische Dateien bereitstellen

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html"); // Root-Route
});

io.on("connection", (socket) => {
    console.log("Ein Nutzer hat sich verbunden");

    // Spieler hinzufügen
    socket.on("add-player", (name) => {
        if (!players.includes(name)) { // Spieler darf nicht doppelt hinzugefügt werden
            players.push(name);
            console.log("Spieler hinzugefügt:", name);
            io.emit("update-players", players); // Aktualisiere die Liste für alle Clients
        } else {
            console.log("Spielername bereits vorhanden:", name);
        }
    });

    // Verbindung trennen
    socket.on("disconnect", () => {
        console.log("Ein Nutzer hat die Verbindung getrennt");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
