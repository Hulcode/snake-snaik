//public vars
let gameOver = false;
let foodX, foodY;
let snakeX = 4,
  snakeY = 9;
let velocityX = 0,
  velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;
class Ui {
  constructor() {
    this.playBoard = document.querySelector(".play-ground");
    this.scoreSpan = document.querySelector(".score");
    this.highScore = document.querySelector(".high-score");
    this.highScore.innerText = `High Score: ${highScore}`;
    this.controls = document.querySelectorAll(".controls i");
  }
}

class snakeGame {
  constructor() {
    this.ui = new Ui();
    this.runGame();
  }

  changeFoodPos() {
    //not array not zero based index
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
  }
  handleGameOver() {
    clearInterval(setIntervalId);
    alert("Game Over! Press Ok to replay...");
    location.reload();
  }
  initGame() {
    if (gameOver) return this.handleGameOver();
    let htmlMarkup = `<div class="food" style = "grid-area: ${foodY}/ ${foodX}"></div>`;
    if (snakeX === foodX && snakeY === foodY) {
      this.changeFoodPos();
      snakeBody.push([foodX, foodY]);
      score++;
      highScore = score >= highScore ? score : highScore;
      this.ui.scoreSpan.innerText = `Score: ${score}`;
      localStorage.setItem("high-score", highScore);
    }
    for (let i = snakeBody.length - 1; i > 0; i--) {
      snakeBody[i] = snakeBody[i - 1];
    }

    snakeBody[0] = [snakeX, snakeY];
    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
      gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
      htmlMarkup += `<div class="head" style = "grid-area: ${snakeBody[i][1]}/ ${snakeBody[i][0]}"></div>`;
      if (
        i !== 0 &&
        snakeBody[0][0] === snakeBody[i][0] &&
        snakeBody[0][1] === snakeBody[i][1]
      ) {
        gameOver = true;
      }
    }
    this.ui.playBoard.innerHTML = htmlMarkup;
  }
  changeDirection(e) {
    if (e.key === "ArrowUp" && velocityY != 1) {
      velocityX = 0;
      velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY != -1) {
      velocityX = 0;
      velocityY = 1;
    } else if (e.key === "ArrowRight" && velocityX != -1) {
      velocityX = 1;
      velocityY = 0;
    } else if (e.key === "ArrowLeft" && velocityX != 1) {
      velocityX = -1;
      velocityY = 0;
    }
  }
  runGame() {
    this.changeFoodPos();

    setIntervalId = setInterval(() => this.initGame(), 120);
    document.addEventListener("keydown", (e) => this.changeDirection(e));
    // Add click handlers for control buttons
    this.ui.controls.forEach((key) => {
      key.addEventListener("click", () => {
        this.changeDirection({ key: key.dataset.key });
      });
    });
  }
}

let game = new snakeGame();
