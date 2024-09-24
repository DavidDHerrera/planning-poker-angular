const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const rooms = {}; // Objeto para almacenar las salas y su información

// Cuando un cliente se conecta
io.on('connection', (socket) => {

  // Cuando se crea una sala
  socket.on('createRoom', ({ roomId, roomName }) => {
    console.log(`Sala creada con ID: ${roomId} y Nombre: ${roomName}`);

    // Almacenar la información de la sala en el objeto 'rooms'
    rooms[roomId] = { roomId, roomName, players: [], revealed: false };

    // El socket se une a la sala recién creada
    socket.join(roomId);

    // Emitir los detalles de la sala al jugador que la crea
    io.to(roomId).emit('roomDetails', { roomId, roomName });
  });

  // Cuando un jugador se une a la sala
  socket.on('joinRoom', ({ playerName, role, roomId }) => {
    console.log(`${playerName} se unió a la sala ${roomId}`);

    // Comprobar si la sala existe
    if (rooms[roomId]) {
      // Verificar si el jugador ya está en la lista para evitar duplicados
      const playerExists = rooms[roomId].players.some(player => player.playerName === playerName);

      if (!playerExists) {
        // Almacenar el jugador en la lista de la sala si no está ya en ella
        rooms[roomId].players.push({ playerName, role, selectedCard: null });
      }

      // El socket se une a la sala existente
      socket.join(roomId);

      // Emitir un evento de que el jugador se unió a la sala
      io.to(roomId).emit('playerJoined', { playerName, role, roomId });

      // Enviar los detalles actualizados de la sala, incluyendo los jugadores
      io.to(roomId).emit('roomDetails', rooms[roomId]);
    } else {
      socket.emit('error', 'Sala no encontrada.');
    }
  });

  // Cuando un jugador selecciona una carta
  socket.on('selectCard', ({ playerName, card, roomId }) => {
    console.log(`${playerName} seleccionó la carta: ${card} en la sala: ${roomId}`);

    // Verifica que la sala existe
    if (rooms[roomId]) {
      console.log(`Enviando actualización de carta a la sala ${roomId}`);

      // Actualizar la carta seleccionada del jugador en la sala
      const player = rooms[roomId].players.find(p => p.playerName === playerName);
      if (player) {
        player.selectedCard = card;
      }

      // Emitir el evento de carta seleccionada a todos los jugadores de esa sala
      io.to(roomId).emit('cardSelected', { playerName, card });
    } else {
      console.log('No se encontró una sala válida para el socket');
    }
  });

  // Cuando el administrador revela las cartas
  socket.on('revealCards', (roomId) => {
    const room = rooms[roomId];
    if (room) {
      const playerCards = room.players.map(player => ({
        playerName: player.playerName,
        selectedCard: player.selectedCard // La carta seleccionada por cada jugador
      }));

      // Emitir las cartas reveladas a todos los jugadores de la sala
      io.to(roomId).emit('cardsRevealed', playerCards);
      room.revealed = true; // Marcar que las cartas han sido reveladas
    }
  });

  socket.on('changeRole', ({ playerName, role, roomId }) => {

    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.playerName === playerName);
      if (player) {
        player.role = role;
        console.log(`${playerName} cambió su rol a ${role} en la sala ${roomId}`);
        io.to(roomId).emit('roleChanged', { playerName, role });
      }
    }
  });

  socket.on('changeAdmin', ({ playerName, roleAdmin, roomId }) => {
    console.log(roleAdmin);

    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.playerName === playerName);
      if (player) {
        player.roleAdmin = roleAdmin;
        console.log(`${playerName} cambió su rol a ${roleAdmin} en la sala ${roomId}`);
        io.to(roomId).emit('changeAdmin', { playerName, roleAdmin });
      }
    }
  });

  socket.on('changeScoringMode', (data) => {
    const { scoringMode, roomId } = data;
    // Actualizar el modo de puntaje en la sala
    const room = rooms[roomId];
    if (room) {
      room.scoringMode = scoringMode;
      io.to(roomId).emit('scoringModeChanged', { scoringMode });
    }
  });

  // Reiniciar la votación en el servidor
  socket.on('restartVoting', (roomId) => {
    if (rooms[roomId]) {
      // Reiniciar las cartas seleccionadas de todos los jugadores en la sala
      rooms[roomId].players.forEach(player => player.selectedCard = null);

      // Emitir el evento de reinicio solo una vez a todos los jugadores de la sala
      io.to(roomId).emit('restartVoting');
      console.log(`Votación reiniciada para la sala ${roomId}`);
    }
  });

  // Cuando un usuario se desconecta
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    // Aquí puedes manejar la lógica para eliminar jugadores de la lista si es necesario
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
