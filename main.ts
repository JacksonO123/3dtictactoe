const port = 3000;
let client: WebSocket;

let game: charType[][][] = [];
let char = '';

connect();

function connect() {
  console.log('connecting...');
  // client = new WebSocket(`wss://threed-tic-tac-toe-server.onrender.com`);
  client = new WebSocket(`ws://localhost:${port}`);

  client.onopen = () => {
    console.log('websocket open');
  };

  client.onmessage = (input: any) => {
    const msg = JSON.parse(input.data) as msgType;
    switch (msg.req) {
      case 'char': {
        char = msg.data.char;
        break;
      }
      case 'stay-alive': {
        const obj = {
          req: 'stay-alive',
        };
        client.send(JSON.stringify(obj));
        break;
      }
      case 'too-many-players': {
        alert('There are too many players, wait until a spot opens up');
        break;
      }
      case 'turn-data': {
        const controls = get('controls');
        if (!controls) break;
        console.log(msg.data.turn);
        if (msg.data.turn) {
          controls.classList.remove('not-turn');
        } else {
          if (!controls.classList.contains('not-turn')) {
            controls.classList.add('not-turn');
          }
        }
        break;
      }
      case 'game-data': {
        game = msg.data.game;
        for (let i = 0; i < game.length; i++) {
          for (let j = 0; j < game[i].length; j++) {
            for (let k = 0; k < game[i][j].length; k++) {
              const cell = get(`${i};${j};${k}`);
              if (!cell) continue;
              if (game[i][j][k] != '') {
                if (char == game[i][j][k]) {
                  if (!cell.classList.contains('player')) {
                    cell.classList.add('player');
                  }
                } else {
                  if (!cell.classList.contains('enemy')) {
                    cell.classList.add('enemy');
                  }
                }
              } else {
                cell.classList.remove('player');
                cell.classList.remove('enemy');
              }
            }
          }
        }
        break;
      }
      case 'winner': {
        const endGameUi = get('end-game');
        if (!endGameUi) break;
        endGameUi.style.display = 'flex';
        const status = get('end-game-status');
        if (!status) break;
        if (msg.data.winner) {
          status.innerText = 'You Win!';
        } else {
          status.innerText = 'You Lose.';
        }
        break;
      }
      default:
        break;
    }
  };

  client.onclose = () => {
    connect();
  };
}

type charType = 'X' | 'O' | '';

type msgType = {
  req:
    | 'char'
    | 'stay-alive'
    | 'too-many-players'
    | 'turn-data'
    | 'game-data'
    | 'winner';
  data: {
    game: charType[][][];
    char: charType;
    turn: boolean;
    winner: boolean;
  };
};

// -----classes----------------------------->

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// -----functions--------------------------->

let dragging = false;
let previous = new Point(0, 0);
let current = new Point(0, 0);

addEventListener('mousedown', e => {
  // @ts-ignore
  if (e.target.id === 'game-overlay') {
    previous = new Point(e.clientX, e.clientY);
    dragging = true;
  }
});

addEventListener('mousemove', e => {
  if (dragging) {
    current = new Point(e.clientX, e.clientY);
    const diffX = current.x - previous?.x;
    const diffY = current.y - previous?.y;
    const perspective = +(getComputedStyle(document.body)?.perspective?.match(
      /\d+/
    ) || [0])[0];
    const angleScale = 10;
    const angleX = (Math.atan2(diffX, perspective) * 180) / Math.PI;
    const angleY =
      (Math.atan2(diffY, pythag(diffX, perspective)) * 180) / Math.PI;

    const xd = get('xd') as HTMLInputElement;
    const yd = get('yd') as HTMLInputElement;
    if (!xd || !yd) return;
    xd.value = +xd.value - angleY * angleScale + '';
    yd.value = +yd.value + angleX * angleScale + '';
    handleRotateX(+xd.value);
    handleRotateY(+yd.value);

    previous = current;
  }
});

addEventListener('mouseup', () => {
  dragging = false;
});

function pythag(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

(window as any).sendInfo = () => {
  const game = get('game') as TicTacToe;
  const posObj = {
    req: 'play-data',
    data: {
      x: game.x,
      y: game.y,
      z: game.z,
    },
  };
  client.send(JSON.stringify(posObj));
};

(window as any).reloadPage = () => location.reload();

function get(id: string) {
  return document.getElementById(id);
}

function h(type: string) {
  return document.createElement(type);
}

function handleRotateX(val: number) {
  const game = get('game') as TicTacToe;
  const xdeg = get('xdeg') as HTMLInputElement;
  if (!game || !xdeg) return;
  game.xDeg = val;
  game.rotate();
  xdeg.innerHTML = `Y deg: ${val}`;
}

function handleRotateY(val: number) {
  const game = get('game') as TicTacToe;
  const ydeg = get('ydeg') as HTMLInputElement;
  if (!game || !ydeg) return;
  game.yDeg = val;
  game.rotate();
  ydeg.innerHTML = `X deg: ${val}`;
}

(window as any).handleXChange = (val: number) => {
  const game = get('game') as TicTacToe;
  const xl = get('xl');
  if (!game || !xl) return;
  game.setX(val);
  xl.innerHTML = `X: ${val + 1}`;
};

(window as any).handleYChange = (val: number) => {
  const game = get('game') as TicTacToe;
  const yl = get('yl');
  if (!game || !yl) return;
  game.setY(val);
  yl.innerHTML = `Y: ${val + 1}`;
};

(window as any).handleZChange = (val: number) => {
  const game = get('game') as TicTacToe;
  const zl = get('zl');
  if (!game || !zl) return;
  game.setZ(val);
  zl.innerHTML = `Z: ${val + 1}`;
};

// -----ui init----------------------------->

class ThreeBox extends HTMLElement {
  id: string;
  constructor() {
    super();
    this.id = '';
  }
  connectedCallback() {
    let blockSize = +(this.getAttribute('size') || 50);
    let [x, y, z] = this.getAttribute('position')!.split(';').map(Number);
    this.id = this.getAttribute('position') || '';
    this.style.transform = `translateX(${x * blockSize}px) translateY(${
      y * blockSize
    }px) translateZ(${z * blockSize - blockSize / 2}px)`;
    this.setSize(this, blockSize);
    const top = h('div');
    top.classList.add('top');
    this.setSize(top, blockSize);
    const bottom = h('div');
    bottom.classList.add('bottom');
    this.setSize(bottom, blockSize);
    const left = h('div');
    left.classList.add('left');
    this.setSize(left, blockSize);
    const right = h('div');
    right.classList.add('right');
    this.setSize(right, blockSize);
    const front = h('div');
    front.classList.add('front');
    this.setSize(front, blockSize);
    const back = h('div');
    back.classList.add('back');
    back.style.transform = `translateZ(${-blockSize}px)`;
    this.setSize(back, blockSize);
    this.innerHTML = '';
    this.appendChild(top);
    this.appendChild(bottom);
    this.appendChild(left);
    this.appendChild(right);
    this.appendChild(front);
    this.appendChild(back);
  }
  setSize(el: HTMLElement, size: number) {
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
  }
}

class TicTacToe extends HTMLElement {
  xDeg: number;
  yDeg: number;
  zDeg: number;
  x: number;
  y: number;
  z: number;
  game: charType[][][];
  constructor() {
    super();
    this.game = [];
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.xDeg = -35;
    this.yDeg = 35;
    this.zDeg = 0;
  }
  setX(value: number) {
    this.x = value;
    this.setSelectedSquare();
  }
  setY(value: number) {
    this.y = value;
    this.setSelectedSquare();
  }
  setZ(value: number) {
    this.z = value;
    this.setSelectedSquare();
  }
  connectedCallback() {
    this.id = 'game';
    let blockSize = 50;
    if (this.hasAttribute('size')) {
      const gameSize = +(this.getAttribute('size') || 200);
      this.style.width = `${gameSize}px`;
      this.style.height = `${gameSize}px`;
      blockSize = Math.floor(gameSize / 3);
    }
    if (blockSize == null) {
      console.warn('tic-tac-toe element must have attribute: size');
      return;
    }
    for (let i = 0; i < 3; i++) {
      game[i] = [];
      for (let j = 0; j < 3; j++) {
        game[i][j] = [];
        for (let k = 0; k < 3; k++) {
          game[i][j][k] = '';
          const block = `<three-box size="${blockSize}" position="${i};${j};${k}"></three-box>`;
          this.innerHTML += block;
        }
      }
    }
    this.setSelectedSquare();
  }
  setSelectedSquare() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          const box = get(`${i};${j};${k}`);
          if (!box) continue;
          box.classList.remove('selected');
        }
      }
    }
    const box = get(`${this.x};${this.y};${this.z}`);
    if (!box) return;
    box.classList.add('selected');
  }
  rotate() {
    this.style.transform = `rotateX(${this.xDeg}deg) rotateY(${this.yDeg}deg) rotateZ(${this.zDeg}deg)`;
  }
}

customElements.define('three-box', ThreeBox);
customElements.define('tic-tac-toe', TicTacToe);
