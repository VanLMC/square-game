const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const COLORS = ['BLUE', 'RED'];
const availableColors = [...COLORS];
const TOTAL_SQUARES = 16;

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'https://square-game-z40f.onrender.com',
}));

const io = new Server(server, {
  cors: {
    origin: 'https://square-game-z40f.onrender.com',
  },
});


let players = [];
let selectedSquares = [];


const getColor = () => {
    if(availableColors.length > 0){
      console.log('availableColors', availableColors)
      const color = availableColors[0];
      availableColors.shift();
      return color;
    }
    else {
      return null;
    }
}

io.on('connection', (socket) => {

  console.log(`user: ${socket.id} connected`);
  const playerColor = getColor();

  const newPlayer = {
    id: socket.id,
    color: playerColor,
  };

  if(playerColor){
    console.log(`player color ${playerColor}`);
    players.push(newPlayer);
    socket.emit('setupPlayer', playerColor);
    socket.emit('message', `You are connected and will play as ${playerColor}`);
  }
  else {
    socket.emit('message', `Sorry, the session is full, you can watch the game though :)`);
  }



  socket.on('clickSquare', (squareId) => {
    if(!playerColor) return;

    const squareAvailable = !selectedSquares.some((square) => square.squareId === squareId);

    if(squareAvailable){
      const newSquare = {
        playerId: socket.id,
        playerColor,
        squareId,
      }

      selectedSquares.push(newSquare);
      io.emit("selectedSquare", selectedSquares);
    }

    const gameOver = selectedSquares.length === TOTAL_SQUARES;

    if(gameOver){

      const playerSquareCounts = selectedSquares.reduce((counts, item) => {
        counts[item.playerColor] = (counts[item.playerColor] || 0) + 1;
        return counts;
      }, {});

      const playerSquareCountsValuesArray = Object.values(playerSquareCounts);
      const playerSquareCountsKeysArray = Object.keys(playerSquareCounts);

      const tie = playerSquareCountsValuesArray.reduce((isTie, squareAmout) => {
        return isTie && squareAmout === playerSquareCountsValuesArray[0] && playerSquareCountsValuesArray.length !== 1;
      }, true);

      if(tie){
        io.emit('message', `Gameover, It's a tie!`)
        io.emit('gameOver');
        return;
      }

      const winner = playerSquareCountsKeysArray.reduce((mostPlayer, player) => {
        return playerSquareCounts[player] > playerSquareCounts[mostPlayer] ? player : mostPlayer;
      }, playerSquareCountsKeysArray[0]);

      io.emit('message', `Gameover, ${winner} won!`)
      io.emit('gameOver');
    }

  });

  socket.on('restart', () => {
    io.emit("message", "The game was restarted");
    players = players.filter((player) => player.id !== socket.id);
    selectedSquares = [];
    io.emit("selectedSquare", selectedSquares);
  });


  socket.on('disconnect', () => {

    const disconectedPlayer = players.find((player) => player.id === socket.id);
    if(!!(disconectedPlayer && disconectedPlayer.color)){
      io.emit("message", "One of the players disconected, the match will be restarted");
      availableColors.unshift(disconectedPlayer.color);
      players = players.filter((player) => player.id !== socket.id);
      selectedSquares = [];
      io.emit("selectedSquare", selectedSquares);
    }

  });


});

server.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});