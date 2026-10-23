const http = require("node:http");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = Number(process.env.PORT || 3000);
const allowedOrigins = new Set([
  "https://madjadoumcyrille-ux.github.io",
  "http://localhost:8080",
  "http://127.0.0.1:8080"
]);
const rooms = new Map();
const words = {
  animaux: [["lion","tigre"],["chat","chien"],["dauphin","baleine"],["abeille","guêpe"],["panda","koala"],["renard","loup"]],
  lieux: [["Paris","Lyon"],["plage","piscine"],["école","université"],["montagne","forêt"],["cinéma","théâtre"],["aéroport","gare"]],
  nourriture: [["pizza","quiche"],["crêpe","gaufre"],["mangue","ananas"],["café","thé"],["burger","sandwich"],["fraise","framboise"]],
  objets: [["téléphone","tablette"],["stylo","crayon"],["vélo","trottinette"],["canapé","fauteuil"],["lunettes","jumelles"],["montre","bracelet"]]
};
const send = (ws, data) => {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
};
const safeName = value => String(value || "Joueur").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, 24) || "Joueur";
function playerList(room) {
  return [...room.players.values()].map(p => ({ id: p.id, name: p.name }));
}
function broadcast(room, data) {
  for (const player of room.players.values()) send(player.ws, data);
}
function sendPlayers(room) {
  broadcast(room, { type: "players", players: playerList(room) });
}
function removePlayer(room, id) {
  const player = room.players.get(id);
  if (!player) return;
  room.players.delete(id);\n  room.votes.delete(id);
  if (id === room.hostId) {
    for (const p of room.players.values()) send(p.ws, { type: "roomClosed" });
    rooms.delete(room.code);
    return;
  }
  sendPlayers(room);
  if (room.phase === "voting" && room.votes.size >= room.players.size) finishRound(room);
}
function finishRound(room) {
  const tally = {};
  for (const id of room.votes.values()) tally[id] = (tally[id] || 0) + 1;
  const top = Object.entries(tally).sort((a,b) => b[1]-a[1])[0];
  const caught = !!(top && room.roles[top[0]] && room.roles[top[0]].impostor);
  const impostor = playerList(room).find(p => room.roles[p.id] && room.roles[p.id].impostor);
  room.phase = "result";
  broadcast(room, {
    type: "result", impostorCaught: caught, word: room.word,
    impostorName: impostor ? impostor.name : "?"
  });
}
function startRound(room, category) {
  if (room.phase !== "lobby" || room.players.size < 3) return;
  const group = category === "mix" || !words[category]
    ? Object.values(words)[Math.floor(Math.random() * Object.keys(words).length)]
    : words[category];
  const pair = group[Math.floor(Math.random() * group.length)];
  room.word = pair[0];
  const ids = [...room.players.keys()];
  const impId = ids[Math.floor(Math.random() * ids.length)];
  room.roles = Object.fromEntries(ids.map(id => [id, id === impId ? { impostor: true } : { impostor: false, word: room.word }]));
  room.votes = new Map();
  room.phase = "discussion";
  for (const [id, player] of room.players) {
    send(player.ws, {
      type: "start",
      role: room.roles[id],
      players: playerList(room)
    });
  }
}
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    return res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
});
const wss = new WebSocketServer({ noServer: true, maxPayload: 4096 });
server.on("upgrade", (req, socket, head) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    return socket.destroy();
  }
  if (req.url !== "/") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    return socket.destroy();
  }
  wss.handleUpgrade(req, socket, head, ws => wss.emit("connection", ws, req));
});
wss.on("connection", ws => {
  let playerId = null;
  let roomCode = null;
  ws.on("message", raw => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch { return send(ws, { type: "error", message: "Message invalide." }); }
    if (!data || typeof data.type !== "string") return;
    if (data.type === "create") {
      if (playerId) return;
      let code;
      do { code = "IMP-" + Math.random().toString(36).slice(2, 8).toUpperCase(); } while (rooms.has(code));
      playerId = require("node:crypto").randomUUID();
      roomCode = code;
      const room = { code, hostId: playerId, players: new Map(), phase: "lobby", roles: {}, votes: new Map(), word: "" };
      room.players.set(playerId, { id: playerId, name: safeName(data.name), ws });
      rooms.set(code, room);
      return send(ws, { type: "created", id: playerId, code, players: playerList(room) });
    }
    if (data.type === "join") {
      if (playerId) return;
      const code = String(data.code || "").trim().toUpperCase();
      const room = rooms.get(code);
      if (!room) return send(ws, { type: "error", message: "Salle introuvable. Vérifie le code ou demande une nouvelle salle." });
      if (room.phase !== "lobby") return send(ws, { type: "error", message: "La partie a déjà commencé. Demande à l’hôte de créer une nouvelle salle." });
      if (room.players.size >= 12) return send(ws, { type: "error", message: "Cette salle est complète (12 joueurs)." });
      playerId = require("node:crypto").randomUUID();
      roomCode = code;
      room.players.set(playerId, { id: playerId, name: safeName(data.name), ws });
      send(ws, { type: "joined", id: playerId, code, players: playerList(room) });
      sendPlayers(room);
      return;
    }
    const room = rooms.get(roomCode);
    if (!room || !playerId) return send(ws, { type: "error", message: "Rejoins une salle avant de jouer." });
    if (data.type === "start" && playerId === room.hostId) {
      if (room.players.size < 3) return send(ws, { type: "error", message: "Il faut au moins 3 joueurs." });
      return startRound(room, String(data.category || "mix"));
    }
    if (data.type === "voteOpen" && playerId === room.hostId && room.phase === "discussion") {
      room.phase = "voting";
      room.votes.clear();
      return broadcast(room, { type: "voteOpen", players: playerList(room) });
    }
    if (data.type === "vote" && room.phase === "voting" && room.players.has(data.target) && data.target !== playerId && !room.votes.has(playerId)) {
      room.votes.set(playerId, data.target);
      broadcast(room, { type: "voteUpdate", count: room.votes.size, total: room.players.size });
      if (room.votes.size >= room.players.size) finishRound(room);
      return;
    }
    if (data.type === "nextRound" && playerId === room.hostId && room.phase === "result") {
      room.phase = "lobby";
      room.roles = {};
      room.votes.clear();
      return broadcast(room, { type: "newRound", players: playerList(room) });
    }
    if (data.type === "heartbeat") return send(ws, { type: "pong" });\n    if (data.type === "leave") {
      removePlayer(room, playerId);
      playerId = null;
      roomCode = null;
    }
  });
  ws.on("close", () => {
    const room = rooms.get(roomCode);
    if (room && playerId) removePlayer(room, playerId);
  });
});
server.listen(PORT, "0.0.0.0", () => console.log("IMPOSTEUR relay listening on " + PORT));
