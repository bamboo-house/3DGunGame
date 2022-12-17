import express from "express";
import http from "http";
import path from "path";
import socketio from "socket.io";

const app: express.Express = express();
const httpServer: http.Server = http.createServer(app);
const io: socketio.Server = new socketio.Server(httpServer);

const FIELD_WIDTH = 1000, FIELD_HEIGHT = 1000;

// プレイヤーの情報をクラスで管理
class Player {
  id: number;
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
  movement: {[key: string]: boolean};

  constructor() {
    this.id = Math.floor(Math.random()*1000000000);
    this.width = 80;
    this.height = 80;
    this.x = Math.random() * (FIELD_WIDTH - this.width);
    this.y = Math.random() * (FIELD_HEIGHT - this.height);
    this.angle = 0;
    this.movement = {};
  }

  move(distance: number) {
    this.x += distance * Math.cos(this.angle);
    this.y += distance * Math.sin(this.angle);
  }
};

let players: {[key: number]: Player} = {};

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

setInterval(() => {
  Object.values(players).forEach((player: Player) => {
    const movement = player.movement;
    if(movement.forward) {
      player.move(5);
    }
    if(movement.back) {
      player.move(-5);
    }
    if(movement.left) {
      player.angle -= 0.1;
    }
    if(movement.right) {
      player.angle += 0.1;
    }
  });

  io.sockets.emit('state', players);
}, 1000/30);

// ミドルウェア設定
app.use('/static', express.static(__dirname + '/static'));

// ルーティング設定
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '/static/index.html'));
});

httpServer.listen(3000, () => {
  console.log('Starting server on port 3000');
});