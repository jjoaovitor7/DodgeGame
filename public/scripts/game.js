// VARIÁVEIS GLOBAIS
// let frames = 0;
let HEIGHT = window.innerHeight;
let WIDTH = window.innerWidth;
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
let gravity = 1;
let score = 0;

// ESTADOS
const states = {
  init: 0,
  playing: 1,
  lost: -1,
  tutorial: 2,
};
let state = states.init;

// CLASSE FLOOR
class Floor {
  #y;
  #height;
  constructor() {
    this.#height = 65;
    this.#y = HEIGHT - this.#height;
  }

  draw() {
    let imgFloor = document.createElement("img");
    imgFloor.src = "./public/assets/floor.png";
    ctx.drawImage(imgFloor, 0, this.#y, WIDTH, this.#height);
  }

  getAttr() {
    return { y: this.#y, height: this.#height };
  }
}

let floor = new Floor();

// CLASSE BOX
class Box {
  #x;
  #y;
  #height;
  #width;
  #velocity;
  #qtdeJumps;
  #jumpHeight;
  #maxJumps;

  constructor() {
    this.#x = 50;
    this.#y = 0;
    this.#height = 50;
    this.#width = 50;
    this.#velocity = 0;
    this.#qtdeJumps = 0;
    this.#jumpHeight = 20;
    this.#maxJumps = 2;
  }

  update() {
    // FAZENDO O BLOCO CAIR / GRAVIDADE
    this.#velocity += gravity;
    this.#y += this.#velocity;

    if (this.#y > floor.getAttr().y - this.#height && state != states.lost) {
      this.#y = floor.getAttr().y - this.#height;
      this.#qtdeJumps = 0;
      this.#velocity = 0;
    }
  }

  jump() {
    if (this.#qtdeJumps < this.#maxJumps) {
      this.#velocity -= this.#jumpHeight;
      this.#qtdeJumps++;
    }
  }

  draw() {
    let imgBox = document.createElement("img");
    imgBox.src = "./public/assets/box.png";
    ctx.drawImage(imgBox, this.#x, this.#y, this.#width, this.#height);
  }

  getAttr() {
    return {
      x: this.#x,
      y: this.#y,
      height: this.#height,
      width: this.#width,
      velocity: this.#velocity,
      qtdeJumps: this.#qtdeJumps,
      jumpHeight: this.#jumpHeight,
      maxJumps: this.#maxJumps,
    };
  }

  reset() {
    this.#y = 0;
    this.#velocity = 0;
  }
}

let player = new Box();

// CLASSE OBSTÁCULOS
class Obstacles {
  #obstaclesArr;
  #interval;

  constructor() {
    this.#obstaclesArr = [];
    this.#interval = 0;
  }

  insert() {
    this.#obstaclesArr.push({
      x: WIDTH,
      width: 25 + Math.floor(Math.random() * 25),
      height: 30 + Math.floor(Math.random() * 80),
    });

    this.#interval = 50 + Math.floor(Math.random() * 20);
  }

  update() {
    if (this.#interval == 0) {
      this.insert();
    } else {
      this.#interval--;
    }

    for (let i = 0; i < this.#obstaclesArr.length; i++) {
      let obstacle = this.#obstaclesArr[i];
      obstacle.x -= 6;

      if (
        // COLISÃO
        (player.getAttr().x < obstacle.x + obstacle.width &&
          player.getAttr().x + player.getAttr().width >= obstacle.x &&
          player.getAttr().y + player.getAttr().height >=
            floor.getAttr().y - obstacle.height) ||
        player.getAttr().y < 0
      ) {
        state = states.lost;
        canvas.style.transitionDuration = "0.1s";
        canvas.style.transform = "translate(1rem, 1rem)";
        canvas.style.transform = "translate(-1rem, -1rem)";

        let _intervalToResetStyle = setInterval(resetStyle, 50);

        function resetStyle() {
          canvas.removeAttribute("style");
          clearInterval(_intervalToResetStyle);
        }
      } else if (obstacle.x <= -obstacle.width) {
        this.#obstaclesArr.splice(i, 1);

        if (state != states.lost) {
          score++;
        }
      }
    }
  }

  clear() {
    this.#obstaclesArr = [];
  }

  draw() {
    for (let i = 0; i < this.#obstaclesArr.length; i++) {
      let obstacle = this.#obstaclesArr[i];
      let imgObstacle = document.createElement("img");
      imgObstacle.src = "./public/assets/obstacle.png";
      ctx.drawImage(
        imgObstacle,
        obstacle.x,
        floor.getAttr().y - obstacle.height,
        obstacle.width,
        obstacle.height
      );
    }
  }
}

let obstacles = new Obstacles();

function getXY(canvas, e) {
  // "MARGENS"
  const canvasRect = canvas.getBoundingClientRect();

  const y = e.clientY - canvasRect.top;
  const x = e.clientX - canvasRect.left;

  return { x: x, y: y };
}

// EVENTO DE CLICAR
function click(event) {
  if (state == states.tutorial) {
    state = states.init;
  }

  let xy = getXY(canvas, event);

  if (xy.x >= canvas.width / 3 && xy.x <= (canvas.width + 20) / 2) {
    if (xy.y >= canvas.height / 3 && xy.y <= (canvas.height + 20) / 2) {
      if (state == states.init) {
        state = states.playing;
      }
    }
    else if (xy.y >= (canvas.height / 3) + 120 && xy.y <= (canvas.height + 100) / 2) {
      if (state == states.init) {
        state = states.tutorial;
      }
    }
  }

  switch (state) {
    case states.playing:
      player.jump();
      break;
    case states.lost:
      state = states.init;
      obstacles.clear();
      score = 0;
      break;
    default:
      break;
  }
}

// ATUALIZANDO TELA
function update() {
  // frames++;
  player.update();
  switch (state) {
    case states.playing:
      obstacles.update();
      break;
    default:
      break;
  }
}

// DESENHANDO OBJETOS
function draw() {
  let imgBackground = document.createElement("img");
  imgBackground.src = "./public/assets/background.png";
  ctx.drawImage(imgBackground, 0, 0, WIDTH, HEIGHT);

  switch (state) {
    case states.init:
      ctx.fillStyle = "#fff";
      ctx.fillRect(WIDTH / 2 - 80, HEIGHT / 2 + 10, 100, -40);
      ctx.fillStyle = "#000";
      ctx.font = "bold 3rem Arial";
      ctx.fillText("Iniciar", WIDTH / 2 - 75, HEIGHT / 2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(WIDTH / 2 - 80, HEIGHT / 2 + 60, 120, -40);
      ctx.fillStyle = "#000";
      ctx.font = "bold 3rem Arial";
      ctx.fillText("Tutorial", WIDTH / 2 - 75, (HEIGHT / 2 )+ 50);
      break;
    case states.tutorial:
      ctx.fillStyle = "#000";

      if (WIDTH > 768) {
        ctx.font = "bold 1.5rem Arial";
      }
      else {
        ctx.font = "bold 1rem Arial";
      }
     
      ctx.fillText("O DodgeGame consiste em desviar de obstáculos.", WIDTH / 2 - (WIDTH * 0.45), HEIGHT / 2 );
      ctx.fillText("Para desviar dos obstáculos (pular) é necessário:", WIDTH / 2 - (WIDTH * 0.45), HEIGHT / 2 + 30);
      ctx.fillText("- Clicar com o mouse na tela (Desktop).", WIDTH / 2 - (WIDTH * 0.45), HEIGHT / 2 + 60);
      ctx.fillText("- Tocar com o dedo na tela (Mobile).",  WIDTH / 2 - (WIDTH * 0.45), HEIGHT / 2 + 90);
      ctx.fillText("Clique ou toque em qualquer parte da tela para sair do tutorial.",  WIDTH / 2 - (WIDTH * 0.45), HEIGHT / 2 + 120);
      break;
    case states.playing:
      ctx.fillStyle = "#000";
      ctx.font = "bold 3rem Arial";
      ctx.fillText(score, 10, 50);
      obstacles.draw();
      break;
    case states.lost:
      ctx.fillStyle = "#000";
      ctx.font = "bold 3rem Arial";
      ctx.fillText("Game Over", WIDTH / 2 - 75, HEIGHT / 2);
      ctx.fillText(`Score: ${score}`, WIDTH / 2 - 75, HEIGHT / 2 + 40);
      break;
    default:
      break;
  }

  floor.draw();
  player.draw();
}

// RODAR O JOGO
function run() {
  update();
  draw();

  window.requestAnimationFrame(run);
}

// FUNÇÃO PRINCIPAL
function main() {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  document.addEventListener("click", click);
  run();
}

// QUANDO A PÁGINA CARREGAR EXECUTE A FUNÇÃO PRINCIPAL DO JOGO
document.addEventListener("DOMContentLoaded", () => {
  main();
});
