// Importuje potřebné moduly
const express = require("express");
const app = express();

const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Vytváří HTTP server pomocí Express aplikace
const server = http.createServer(app);

// Inicializuje nový Socket.IO server
const io = new Server(server);

// Nastavuje statický adresář pro obsluhu statických souborů
app.use(express.static(path.resolve("")));

// Pole pro uložení připojených hráčů čekajících na zápas
let arr = [];
// Pole pro uložení zápasů, které právě probíhají
let playingArray = [];

// Naslouchá na událost 'connection', která se spustí, když se nový klient připojí
io.on("connection", (socket) => {
    // Naslouchá na událost 'find', kterou klient vyšle při hledání zápasu
    socket.on("find", (e) => {
        // Kontrola, zda jméno není prázdné
        if (e.name != null) {
            // Přidá jméno hráče do pole čekajících hráčů
            arr.push(e.name);

            // Kontrola, zda jsou dva hráči připraveni hrát
            if (arr.length >= 2) {
                // Vytvoření objektu pro prvního hráče
                let p1obj = {
                    p1name: arr[0],
                    p1value: "X",
                    p1move: ""
                };
                // Vytvoření objektu pro druhého hráče
                let p2obj = {
                    p2name: arr[1],
                    p2value: "O",
                    p2move: ""
                };

                // Vytvoření objektu zápasu obsahující oba hráče
                let obj = {
                    p1: p1obj,
                    p2: p2obj,
                    sum: 1 // Počítadlo tahů
                };
                // Přidání zápasu do pole probíhajících zápasů
                playingArray.push(obj);

                // Odstranění hráčů z pole čekajících hráčů
                arr.splice(0, 2);

                // Odeslání aktualizovaného seznamu zápasů všem klientům
                io.emit("find", { allPlayers: playingArray });
            }
        }
    });

    // Naslouchá na událost 'playing', kterou klient vyšle při provedení tahu
    socket.on("playing", (e) => {
        // Kontrola, zda hráč má hodnotu "X"
        if (e.value == "X") {
            // Nalezení zápasu, ve kterém je hráč s hodnotou "X"
            let objToChange = playingArray.find(obj => obj.p1.p1name === e.name);
            // Aktualizace tahu hráče "X"
            objToChange.p1.p1move = e.id;
            objToChange.sum++;
        }
        // Kontrola, zda hráč má hodnotu "O"
        else if (e.value == "O") {
            // Nalezení zápasu, ve kterém je hráč s hodnotou "O"
            let objToChange = playingArray.find(obj => obj.p2.p2name === e.name);
            // Aktualizace tahu hráče "O"
            objToChange.p2.p2move = e.id;
            objToChange.sum++;
        }

        // Odeslání aktualizovaného seznamu zápasů všem klientům
        io.emit("playing", { allPlayers: playingArray });
    });

    // Naslouchá na událost 'gameOver', kterou klient vyšle při ukončení zápasu
    socket.on("gameOver", (e) => {
        // Odstranění zápasu, ve kterém byl hráč
        playingArray = playingArray.filter(obj => obj.p1.p1name !== e.name);
        console.log(playingArray);
        console.log("lol");
    });
});

// Obsluha GET požadavku na hlavní stránku
app.get("/", (req, res) => {
    return res.sendFile("index.html");
});

// Spuštění serveru na portu 3000
server.listen(3000, () => {
    console.log("port connected to 3000");
});
