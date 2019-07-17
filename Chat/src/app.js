/**
 * File to create node server for chat api using socket.io
 */

 import http from 'http';
 import express from 'express';
 import cors from 'cors';
 import io from 'socket.io';
 import config from '../config/config.json';
 import path from 'path';
 import mongo from 'mongodb';

//setup server

const app = express();
const server = http.createServer(app);
const socketIO = io(server);

//allow CORS
app.use(cors());

//Render a API index page

app.get('/', (req, res) => {
    res.sendFile(path.resolve('public/index.html'));
});

//start listening at PORT

server.listen(process.env.PORT || config.port);
console.log(`server started on ${config.port}`);

 //setup db
const mongodb = mongo.MongoClient;
mongo.connect('mongodb://127.0.0.1/mongochat', (err, dbclient)=>{
    if(err){
        throw err;
    }
    
    //creating new db
    let db = dbclient.db('chatdb');
    console.log('DB connected');

    //setup socket connection for chat
    socketIO.on('connection', socket => {
        const username = socket.handshake.query.username; //checking query params

        //creating mongo collection for chats history
        let chats = db.collection('chats');

        //creating mongo collection for users
        let users = db.collection('users');

        //check user login status
        // socket.on('login',(data)=>{
        //     let user=users.insertOne({[socket.id]:data.userId});
        // });

        //create function to send status
        let sendStatus = (s) =>{
            socket.emit('status',s);
        };

        //broadcast status to other users
        let broadcastStatus = s =>{
            socket.broadcast.emit('status',s);
        }

        broadcastStatus({ message: `${username} connected` });

        //get chats from database
        chats.find().limit(50).sort({_id:1}).toArray((err, res)=>{
            if(err){
                throw err;
            }
            //Emit the messages to client
            // console.log(res);
            socket.emit('server:message', res);
        });

        socket.on('client:message', data => {
            console.log(`${data.username} : ${data.message}`);
            //message received from client, now broadcast to all
            let username=data.username;
            let message = data.message;
            if (!username || !message){
                sendStatus({message:'Please send a name and message'});
            }else{
                chats.insertOne({username:username, message:message},()=>{
                    //emit to all
                    socket.broadcast.emit('server:message', [data]);
                    //emit to self
                    socket.emit('server:message', [data]);
                });
                sendStatus({
                    message:'Message sent',
                });
            }
        });

        socket.on('clear',(data)=>{
            // remove chats from db
            chats.deleteMany({},()=>{
                socket.emit('cleared');
            });

        });

        socket.on('disconnect', () => {
            console.log(`user disconnected`);
            broadcastStatus({ message: `${username} connected` });
        });
    });
    // dbclient.close();

});

export default app;