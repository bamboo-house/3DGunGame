import { io } from "socket.io-client";
import $ from 'jquery';
const socket = io();
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const playerImage = $('#player-image')[0];
let movement = {};
const gameStart = () => {
    socket.emit('game-start');
};
$(document).on('keydown keyup', (event) => {
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
