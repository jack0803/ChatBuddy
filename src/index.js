import express from 'express';
import path from 'path';
import {Server} from 'socket.io';
// HTTP modules let you examine incoming and outgoing requests and take action based on the request.
import http from 'http';
import { fileURLToPath } from 'url';
import { Socket } from 'dgram';
import {generateMessage , generateLocationMessage} from './utils/messages.js';
import { addUser, getUser, getUsersInRoom, removeUser} from './utils/users.js';

const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
import Filter from 'bad-words';
//by doing this now server supports web sockets     
const io = new  Server(server) 

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pubilcdirpath = path.join(__dirname, '../public')

//connectio and disconnection are built in event
io.on('connection' , (socket) =>{
    console.log('new websocket connection');
    
    socket.on('join' , ({username , room} ,  callback) => {
        //id= connection id when user joins room
        const{error , user} = addUser({ id: socket.id , username: username , room: room }) 
        
        if(error){
            //here call the callback which is return in chat.js as error handler in socket.emit('join')
           return callback(error)
        }

        socket.join(user.room) 

        //now here we emit an object
        socket.emit('message',generateMessage(`welcome ${user.username}!`))

        socket.broadcast.to(user.room).emit('message' , generateMessage(`${user.username} has joined the room`))

        io.to(user.room).emit('roomData' , {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        //this call back let user know that no error occure
        callback()

        
    })
    
    
    //---------------------------------------------------------------------->
    //reciving user massage
    socket.on('sendMessage' , (text , callback) => {
        
        const user = getUser(socket.id )
        //making an instance of Filter(bad-words) 
        const filter = new Filter()
        if(filter.isProfane(text)){
            return callback('Do not use bad words')
        }
        //here we getting an time stamp of all messages by using generateMessages()
        io.to(user.room).emit('message' , generateMessage(user.username , text))
        //this call back aknowladge to client that your message has been send successfully
        callback('deliverd!')
    })
    
    //---------------------------------------------------------------------->
    //receving user location
    socket.on('sendLocation' , (coords , callback) => {
        const user = getUser(socket.id )
        //making google map URL to see the position in map
        io.to(user.room).emit('locationMessage' , generateLocationMessage(user.username , coords))
        callback('location deliverd!')
    })
    
    
    //----------------------------------------------------------------------> 
    //when uer leave or break the connection 
    socket.on('disconnect' , () => {
        const user = removeUser(socket.id)

        if(user){
            //by using to it will send the message to that perticuler room
            io.to(user.room).emit('message' ,generateMessage(`${user.username} has left the room!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

})




// let count = 0

//server(emit) --> client(recive) - countUpdate
//client(emit) --> server(recive) - increment 

//arrgument socket contains info about new connection(client)
//this function run every time when new connection made 
// io.on('connection' , (socket) => {
//     //after setup an connection with client site
//     console.log('new websocket connection');

//     //sending an event and event is accept in client
//     socket.emit('countUpdated' , count)
    
//     //listing an increment event form client
//     socket.on('increment' , () => {
//         count = count + 1
//         //this method send event to specific connection
//         // socket.emit('countUpdated' , count)

//         //this will sent to all client who established an connection
//         io.emit('countUpdated' , count)
//     })
// })


//if we set an page by using app.use() the app.get() at that endpoint will not render now you can access any file or dir public by simapally adding /about.html or /weather.html
//here we use static means the assets we used are static
app.use(express.static(pubilcdirpath))


server.listen(port , () => {
    console.log('server started on' + port);
})