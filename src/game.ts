import { io } from "socket.io-client";
import $ from 'jquery';

const socket = io();
const canvas = $('#canvas-2d')[0];
const context = canvas.getContext('2d');
const playerImage = $('#player-image')[0];
let movement = {};