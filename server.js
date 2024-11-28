const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = []; // Liste der Spieler

// Statische Dateien bereitstellen
app.use(express.static(__dirname));

// Route für die Hauptseite
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Socket.io-Verbindung
io.on("connection", (socket) => {
    console.log("Ein Nutzer hat sich verbunden");

    // Spieler hinzufügen
    socket.on("add-player", (name) => {
        if (!players.includes(name)) { // Spielername darf nicht doppelt sein
            players.push(name);
            console.log(`Spieler hinzugefügt: ${name}`);
            io.emit("update-players", players); // Aktualisiere Spieler-Liste für alle Clients
        } else {
            console.log(`Spielername bereits vorhanden: ${name}`);
        }
    });

    // Verbindung trennen
    socket.on("disconnect", () => {
        console.log("Ein Nutzer hat die Verbindung getrennt");
    });
});

// Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
