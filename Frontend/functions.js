import { classToColorMapper } from "./constants.js";

const showRestartButton = (show) => {
    const container = document.getElementById('restart-button-container');
    container.style.opacity = show ? 1 : 0;
}

const showMessage = (message) => {
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.style.opacity = 1;
    setTimeout(() => {
      messageElement.style.opacity = 0;
    }, 3000);
}

const selectSquare = (squareId, color) => {
  const newClass = classToColorMapper[color];
  const square = document.getElementById(squareId);
  square.classList.add(newClass);
}

const resetSquares = () => {
  const squareElements = document.querySelectorAll(".square");
  squareElements.forEach((element) => {
    element.classList.remove("blue-background");
    element.classList.remove("red-background");
  });
  showRestartButton(false);
}

const updateSquares = (selectedSquares) => {

  if(selectedSquares.length === 0){
    resetSquares();
  }

  selectedSquares.forEach(({squareId, playerColor}) => {
    selectSquare(squareId, playerColor);
  })
}

export { showRestartButton, showMessage, updateSquares};