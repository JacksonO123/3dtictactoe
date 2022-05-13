const port = 3000;
const client = new WebSocket(`ws://localhost:${port}`);
// const client = new WebSocket(`wss://the3dtictactoe.herokuapp.com`);

client.onopen = () => {
	console.log('websocket open');
}

client.onmessage = msg => {
	msg = JSON.parse(msg.data);
	console.log(msg);
}

client.onclose = () => {
	console.log('websocket closed');
}

let tempSet = [];
class ThreeBox extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		let blockSize = +this.getAttribute('size');
		let [x, y, z] = this.getAttribute('position').split(';').map(Number);
		this.id = this.getAttribute('position');
		this.style.transform = `translateX(${x * blockSize}px) translateY(${y * blockSize}px) translateZ(${z * blockSize + 1}px)`;
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
		this.setSize(back, blockSize);
		this.innerHTML = '';
		this.appendChild(top);
		this.appendChild(bottom);
		this.appendChild(left);
		this.appendChild(right);
		this.appendChild(front);
		this.appendChild(back);
	}
	setSize(el, size) {
		el.style.width = `${size}px`;
		el.style.height = `${size}px`;
	}
}

class TicTacToe extends HTMLElement {
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
	setX(value) {
		this.x = value;
		this.setSelectedSquare();
	}
	setY(value) {
		this.y = value;
		this.setSelectedSquare();
	}
	setZ(value) {
		this.z = value;
		this.setSelectedSquare();
	}
	connectedCallback() {
		this.id = 'game';
		let blockSize = null;
		if (this.hasAttribute('size')) {
			const gameSize = +this.getAttribute('size');
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
					get(`${i};${j};${k}`).classList.remove('selected');
				}
			}
		}
		get(`${this.x};${this.y};${this.z}`).classList.add('selected');
	}
	rotate() {
		this.style.transform = `rotateX(${this.xDeg}deg) rotateY(${this.yDeg}deg) rotateZ(${this.zDeg}deg)`;
	}
}

const get = (id) => {
	return document.getElementById(id);
}

const h = (type) => {
	return document.createElement(type);
}

const handleRotateX = (val) => {
	get('game').xDeg = val;
	get('game').rotate();
	get('xdeg').innerHTML = `Y deg: ${val}`;
}

const handleRotateY = (val) => {
	get('game').yDeg = val;
	get('game').rotate();
	get('ydeg').innerHTML = `X deg: ${val}`;
}

const handleRotateZ = (val) => {
	get('game').zDeg = val;
	get('game').rotate();
	get('zdeg').innerHTML = `Z deg: ${val}`;
}

const handleXChange = (val) => {
	get('game').setX(val);
	get('xl').innerHTML = `X: ${val + 1}`;
}

const handleYChange = (val) => {
	get('game').setY(val);
	get('yl').innerHTML = `Y: ${val + 1}`;
}

const handleZChange = (val) => {
	get('game').setZ(val);
	get('zl').innerHTML = `Z: ${val + 1}`;
}

customElements.define('three-box', ThreeBox);
customElements.define('tic-tac-toe', TicTacToe);

// -----functions--------------------------->

function sendInfo() {
	const game = get('game');
	console.log(game.x, game.y, game.z);
	const posObj = { x: game.x, y: game.y, z: game.z };
	console.log(posObj);
	client.send(JSON.stringify(posObj));
}
