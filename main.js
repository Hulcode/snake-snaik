// Public vars
let gameOver = false;
let foodX, foodY;
let snakeX = 15,
  snakeY = 15;
let velocityX = 0,
  velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;
let lastTouchTime = 0;
const TOUCH_DELAY = 100; // ms between touch events

class Ui {
  constructor() {
    this.playBoard = document.querySelector(".play-ground");
    this.scoreSpan = document.querySelector(".score");
    this.highScoreSpan = document.querySelector(".high-score");
    this.highScoreSpan.innerText = `High Score: ${highScore}`;
    this.controls = document.querySelectorAll(".controls i");
    this.initTouchEvents();
  }

  initTouchEvents() {
    // Prevent default touch behaviors
    this.playBoard.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    this.playBoard.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }
}

class SnakeGame {
  constructor() {
    this.ui = new Ui();
    this.isMobile = "ontouchstart" in window;
    this.runGame();
  }

  changeFoodPos() {
    let onSnake;
    do {
      onSnake = false;
      foodX = Math.floor(Math.random() * 30) + 1;
      foodY = Math.floor(Math.random() * 30) + 1;

      if (foodX === snakeX && foodY === snakeY) onSnake = true;

      for (let segment of snakeBody) {
        if (foodX === segment[0] && foodY === segment[1]) {
          onSnake = true;
          break;
        }
      }
    } while (onSnake);
  }

  handleGameOver() {
    clearInterval(setIntervalId);

    // Use setTimeout to ensure alert doesn't block game loop
    setTimeout(() => {
      alert(
        `Game Over!\nScore: ${score}\nHigh Score: ${highScore}\nTap OK to replay`
      );
      location.reload();
    }, 100);
  }

  initGame() {
    if (gameOver) return this.handleGameOver();

    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snakeX === foodX && snakeY === foodY) {
      this.changeFoodPos();
      snakeBody.push([foodX, foodY]);
      score++;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem("high-score", highScore);
        this.ui.highScoreSpan.innerText = `High Score: ${highScore}`;
      }

      this.ui.scoreSpan.innerText = `Score: ${score}`;
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
      const className = i === 0 ? "head" : "snake-body";
      htmlMarkup += `<div class="${className}" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;

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

  changeDirection(key) {
    const now = Date.now();

    // Throttle touch events on mobile
    if (this.isMobile && now - lastTouchTime < TOUCH_DELAY) {
      return;
    }
    lastTouchTime = now;

    if (key === "ArrowUp" && velocityY !== 1) {
      velocityX = 0;
      velocityY = -1;
    } else if (key === "ArrowDown" && velocityY !== -1) {
      velocityX = 0;
      velocityY = 1;
    } else if (key === "ArrowRight" && velocityX !== -1) {
      velocityX = 1;
      velocityY = 0;
    } else if (key === "ArrowLeft" && velocityX !== 1) {
      velocityX = -1;
      velocityY = 0;
    }
  }

  runGame() {
    this.changeFoodPos();

    // Clear any existing interval
    if (setIntervalId) {
      clearInterval(setIntervalId);
    }

    setIntervalId = setInterval(() => this.initGame(), 120);

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        this.changeDirection(e.key);
      }
    });

    // Touch controls with better touch handling
    this.ui.controls.forEach((key) => {
      // Remove existing listeners
      const newKey = key.cloneNode(true);
      key.parentNode.replaceChild(newKey, key);

      // Add new listeners with touch support
      newKey.addEventListener("click", (e) => {
        e.preventDefault();
        this.changeDirection(newKey.dataset.key);
      });

      newKey.addEventListener("touchstart", (e) => {
        e.preventDefault();
        newKey.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        this.changeDirection(newKey.dataset.key);
      });

      newKey.addEventListener("touchend", (e) => {
        e.preventDefault();
        newKey.style.backgroundColor = "";
      });

      newKey.addEventListener("touchcancel", (e) => {
        e.preventDefault();
        newKey.style.backgroundColor = "";
      });
    });

    // Also allow swipe controls on the game board
    let touchStartX = 0;
    let touchStartY = 0;

    this.ui.playBoard.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
      },
      { passive: false }
    );

    this.ui.playBoard.addEventListener(
      "touchend",
      (e) => {
        if (!touchStartX || !touchStartY) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Determine swipe direction
        if (Math.abs(diffX) > Math.abs(diffY)) {
          // Horizontal swipe
          if (diffX > 0 && velocityX !== 1) {
            this.changeDirection("ArrowLeft");
          } else if (diffX < 0 && velocityX !== -1) {
            this.changeDirection("ArrowRight");
          }
        } else {
          // Vertical swipe
          if (diffY > 0 && velocityY !== 1) {
            this.changeDirection("ArrowUp");
          } else if (diffY < 0 && velocityY !== -1) {
            this.changeDirection("ArrowDown");
          }
        }

        touchStartX = 0;
        touchStartY = 0;
        e.preventDefault();
      },
      { passive: false }
    );
  }
}

// Start game when page is fully loaded
window.addEventListener("load", () => {
  // Small delay to ensure all elements are ready
  setTimeout(() => {
    const game = new SnakeGame();

    // iOS specific: prevent bounce/scroll
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }, 100);
});
