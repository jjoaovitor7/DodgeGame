// VARIÁVEIS GLOBAIS
let frames = 0;
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
};
let state = states.init;

// CLASSE FLOOR
class Floor {
  #y;
  #height;
  #color;
  constructor() {
    this.#y = 550;
    this.#height = 50;
    this.#color = "#fff";
  }

  draw() {
    ctx.fillStyle = this.#color;
    ctx.fillRect(0, this.#y, WIDTH, this.#height);
  }

  getAttr() {
    return { y: this.#y, height: this.#height, color: this.#color };
  }
}

let floor = new Floor();

// CLASSE BOX
class Box {
  #x;
  #y;
  #height;
  #width;
  #color;
  #velocity;
  #qtdeJumps;
  #jumpHeight;
  #maxJumps;

  constructor() {
    this.#x = 50;
    this.#y = 0;
    this.#height = 50;
    this.#width = 50;
    this.#color = "#fff";
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
    ctx.fillStyle = this.#color;
    ctx.fillRect(this.#x, this.#y, this.#width, this.#height);
  }

  getAttr() {
    return {
      x: this.#x,
      y: this.#y,
      height: this.#height,
      width: this.#width,
      color: this.#color,
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
  #colors;
  #interval;

  constructor() {
    this.#obstaclesArr = [];
    this.#colors = ["#000080", "#00FA9A", "#7CFC00", "#4B0082", "#FFFF00"];
    this.#interval = 0;
  }

  insert() {
    this.#obstaclesArr.push({
      x: WIDTH,
      width: 25 + Math.floor(Math.random() * 30),
      height: 25 + Math.floor(Math.random() * 80),
      color: this.#colors[Math.floor(Math.random() * this.#colors.length)],
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
        player.getAttr().x < obstacle.x + obstacle.width &&
        player.getAttr().x + player.getAttr().width >= obstacle.x &&
        player.getAttr().y + player.getAttr().height >=
          floor.getAttr().y - obstacle.height
      ) {
        state = states.lost;
      }

      else if (obstacle.x <= -obstacle.width) {
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
      ctx.fillStyle = obstacle.color;
      ctx.fillRect(
        obstacle.x,
        floor.getAttr().y - obstacle.height,
        obstacle.width,
        obstacle.height
      );
    }
  }
}

let obstacles = new Obstacles();

// EVENTO DE CLICAR
function click(event) {
  switch (state) {
    case states.init:
      state = states.playing;
      break;
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
  frames++;

  if (player.getAttr().y < 0) {
    state = states.lost;
  }
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
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  switch (state) {
    case states.init:
      ctx.fillStyle = "#fff";
      ctx.font = "bold 30px Arial"
      ctx.fillText("Iniciar", WIDTH / 2 - 50, HEIGHT / 2 - 50, 100, 100);
      break;
    case states.playing:
      obstacles.draw();
      break;
    case states.lost:
      ctx.fillStyle = "#fff";
      ctx.font = "bold 30px Arial"
      ctx.fillText("Game Over", WIDTH / 2 - 50, HEIGHT / 2 - 50, 100, 100);
      ctx.fillText(`Score: ${score}`, WIDTH / 2 - 50, HEIGHT / 2, 100, 100);
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
  if (WIDTH >= 500) {
    WIDTH = 600;
    HEIGHT = 600;
  }

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  document.addEventListener("click", click);
  run();
}

// QUANDO A PÁGINA CARREGAR EXECUTE A FUNÇÃO PRINCIPAL DO JOGO
document.addEventListener("DOMContentLoaded", () => {
  main();
});