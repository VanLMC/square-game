import { showRestartButton, showMessage, updateSquares} from './functions.js';

const socket = io('https://square-game-server.onrender.com:10000');

let playingAs = undefined;

socket.on('setupPlayer', (color) => {
  playingAs = color;
});

socket.on('gameOver', () => {
  if(!!playingAs){
    showRestartButton(true);
  }
});

socket.on('message', (message) => {
  console.log('message', message)
  showMessage(message);
});

socket.on('selectedSquare', updateSquares);

const clickSquare = (event) => {
  if(!playingAs) return;

  if (event.target.classList.contains('square')) {
    socket.emit('clickSquare', event.target.id);
  }
}

const gridContainer = document.getElementById('grid-container');
gridContainer.addEventListener('click', clickSquare);

const restartGame = () => {
  socket.emit('restart');
}

const restartButton = document.getElementById('restart-button');
restartButton.addEventListener('click', restartGame)





