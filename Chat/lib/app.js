'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _config = require('../config/config.json');

var _config2 = _interopRequireDefault(_config);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//setup server

var app = (0, _express2.default)(); /**
                                     * File to create node server for chat api using socket.io
                                     */

var server = _http2.default.createServer(app);
var socketIO = (0, _socket2.default)(server);

//allow CORS
app.use((0, _cors2.default)());

//Render a API index page

app.get('/', function (req, res) {
    res.sendFile(_path2.default.resolve('public/index.html'));
});

//start listening at PORT

server.listen(process.env.PORT || _config2.default.port);
console.log('server started on ' + _config2.default.port);

//setup db
var mongodb = _mongodb2.default.MongoClient;
_mongodb2.default.connect('mongodb://127.0.0.1/mongochat', function (err, dbclient) {
    if (err) {
        throw err;
    }

    //creating new db
    var db = dbclient.db('chatdb');
    console.log('DB connected');

    //setup socket connection for chat
    socketIO.on('connection', function (socket) {
        var username = socket.handshake.query.username; //checking query params

        //creating mongo collection for chats history
        var chats = db.collection('chats');

        //creating mongo collection for users
        var users = db.collection('users');

        //check user login status
        // socket.on('login',(data)=>{
        //     let user=users.insertOne({[socket.id]:data.userId});
        // });

        //create function to send status
        var sendStatus = function sendStatus(s) {
            socket.emit('status', s);
        };

        //broadcast status to other users
        var broadcastStatus = function broadcastStatus(s) {
            socket.broadcast.emit('status', s);
        };
        console.log(username + ' connected');
        broadcastStatus({ message: username + ' connected' });

        //get chats from database
        chats.find().limit(50).sort({ _id: 1 }).toArray(function (err, res) {
            if (err) {
                throw err;
            }
            //Emit the messages to client
            // console.log(res);
            socket.emit('server:message', res);
        });

        socket.on('client:message', function (data) {
            console.log(data.username + ' : ' + data.message);
            //message received from client, now broadcast to all
            var username = data.username;
            var message = data.message;
            if (!username || !message) {
                sendStatus({ message: 'Please send a name and message' });
            } else {
                chats.insertOne({ username: username, message: message }, function () {
                    //emit to all
                    socket.broadcast.emit('server:message', [data]);
                    //emit to self
                    socket.emit('server:message', [data]);
                });
                sendStatus({
                    message: 'Message sent'
                });
            }
        });

        socket.on('clear', function (data) {
            // remove chats from db
            chats.deleteMany({}, function () {
                socket.emit('cleared');
            });
        });

        socket.on('disconnect', function () {
            console.log(username + ' disconnected');
            broadcastStatus({ message: username + ' disconnected' });
        });
    });
    // dbclient.close();
});

exports.default = app;