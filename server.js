'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);

const FIELD_WIDTH = 1000, FIELD_HEIGHT = 1000;

class GameObject{
    constructor(obj={}){
        this.id = Math.floor(Math.random()*1000000000);
        this.x = obj.x;
        this.y = obj.y;
        this.width = obj.width;
        this.height = obj.height;
        this.angle = obj.angle;
    }

    move(distance){
        const oldX = this.x
        const oldY = this.y;

        this.x += distance * Math.cos(this.angle);
        this.y += distance * Math.sin(this.angle);

        let collision = false;

        if(this.x < 0 || this.x + this.width >= FIELD_WIDTH || this.y <0 || this.y + this.height >= FIELD_HEIGHT){
            collision = ture;
        }
        if(this.intersectWalls()){
            collision = true;
        }
        if(collision){
            this.x = oldX;
            this.y = oldY;
        }
        return !collision;
    }

    intersect(obj){
        return (this.x <= obj.x + obj.width) &&
                (this.x + this.width >= obj.x) &&
                (this.y <= obj.y + obj.height) &&
                (this.y + this.height >= obj.y);
    }

    intersectWalls(){
        return Object.values(walls).some((wall) => {
            if(this.intersect(wall)){
                return true;
            }
        });
    }
    
    toJSON(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            angle: this.angle
        };
    };
};

class Player extends GameObject{
    constructor(obj={}){
        super(obj);
        this.socketId = obj.socketId;
        this.nickname = obj.nickname;
        this.width = 80;
        this.height = 80;
        this.health = this.maxHealth = 10;
        this.bullets = {};
        this.point = 0;
        this.movement = {};

        do{
            this.x = Math.random() * (FIELD_WIDTH - this.width);
            this.y = Math.random() * (FIELD_HEIGHT - this.height);
            this.angle = 0;
        }while(this.intersectWalls());

    }

    move(distance){
        this.x += distance * Math.cos(this.angle);
        this.y += distance * Math.sin(this.angle);
    }
};

let players = {};

io.on('connection', function(socket) {
    let player = null;
    socket.on('game-start', (config) => {
        player = new Player({
            socketId: socket.id,
        });
        players[player.id] = player;
    });
    socket.on('movement', function(movement) {
        if(!player){return;}
        player.movement = movement;
    });
    socket.on('disconnect', () => {
        if(!player){return;}
        delete players[player.id];
        player = null;
    });
});

setInterval(function() {
    Object.values(players).forEach((player) => {
        const movement = player.movement;
        if(movement.forward){
            player.move(5);
        }
        if(movement.back){
            player.move(-5);
        }
        if(movement.left){
            player.angle -= 0.1;
        }
        if(movement.right){
            player.angle += 0.1;
        }
    });
    io.sockets.emit('state', players);
}, 1000/30);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '/static/index.html'));
});

server.listen(3000, function() {
  console.log('Starting server on port 3000');
});