import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

const app: express.Express = express();
const server: http.Server = http.createServer();
const io = new Server(server);

const FIELD_WIDTH = 1000, FIELD_HEIGHT = 1000;

// プレイヤーの情報をクラスで管理
class Player {
  id: number;
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
  movement: object;

  constructor() {
    this.id = Math.floor(Math.random()*1000000000);
    this.width = 80;
    this.height = 80;
    this.x = Math.random() * (FIELD_WIDTH - this.width);
    this.y = Math.random() * (FIELD_HEIGHT - this.height);
    this.angle = 0;
    this.movement = {};
  }
}; 

let players = {};


io.on('connection', function(socket) {
  let player: Player | null = null;
  socket.on('game-start', (config) => {
    player = new Player();
    players[player.id] = player;
  });

  socket.on('movement',  (movement) =>  {
    if (!player) return;
    player.movement = movement;
  });

  socket.on('disconnect', () => {
    if(!player) return;
    delete players[player.id];
    player = null;
  });
});