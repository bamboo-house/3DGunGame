"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const jquery_1 = __importDefault(require("jquery"));
const socket = (0, socket_io_client_1.io)();
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const playerImage = (0, jquery_1.default)('#player-image')[0];
let movement = {};
const gameStart = () => {
    socket.emit('game-start');
};
(0, jquery_1.default)(document).on('keydown keyup', (event) => {
    const KeyToCommand = {
        'ArrowUp': 'forward',
        'ArrowDown': 'back',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
    };
    const command = KeyToCommand[event.key];
    if (command) {
        if (event.type === 'keydown') {
            movement[command] = true;
        }
        else {
            movement[command] = false;
        }
        socket.emit('movement', movement);
    }
});
socket.on('state', (players, bullets, walls) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 10;
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();
    Object.values(players).forEach((player) => {
        context.drowImage(playerImage, player.x, player.y);
        context.font = '30px Bold Arial';
        context.fillText('Player', player.x, player.y - 20);
    });
});
socket.on('connect', gameStart);
