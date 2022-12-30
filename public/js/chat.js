//initialize connetion
const socket = io() 

//elements
//here we use $ sing to identify that it is an element
const $messageform = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendlocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Option
//here we use QS script to find url query value
//location.search will give us an qurery string of chat.html when we join any room : ?username=fssdfs&room=fsd
const {username , room} = Qs.parse(location.search , { ignoreQueryPrefix: true }) // removing first ? form query string
console.log(username);

const autoscroll = () => {
    //get new message element
    const $newMessage =  $messages.lastElementChild

    //get the Height of new (last) messasge
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible heigh screen in which messages shown
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scroll?
    //ammount of distance we have scroll from the top message
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin);
}

// --------------------------------------------------------------------------------->
//event handler for text messages
socket.on('message' , (message) => {
    //here the message is an object
    console.log(message);
    //html store the final html rendering inthe browser
    const html = Mustache.render(messageTemplate, {
        username: message.username , 
        //when there any event occure io.emit('message' , text) will emit an message of that perticuler event
        message: message.text,
        //formating time
        //for formating token's like mm , h visit: momentjs.com
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    //insertAdjacentHTML this methods allows us to add some new html to browser
    //beforeend this will show message at before the "messages" div ended
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//event handler for location 
socket.on('locationMessage' , (location) => {
    console.log(location);
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')

    })
    
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room , users}) => {
    const html = Mustache.render(sidebarTemplate , {
        room: room, 
        users: users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// --------------------------------------------------------------------------------->
$messageform.addEventListener('submit' , (e) => {
    e.preventDefault() 
    
    //after sending an message we disable the send button while sending an message
    $messageFormButton.setAttribute('disabled' , 'disabled')
    
    //here target points to form then elements point towars input and button and then we access input by it's name property
    const text = e.target.elements.message.value
 
    socket.emit('sendMessage' , text , (error) => {
        $messageFormButton.removeAttribute('disabled')
        
        //clear the input box after sending message
        $messageFormInput.value = ''
        //it will set cursor inside input box
        $messageFormInput.focus() 
        if(error)
        {
            return console.log(error);
        }
        console.log('message deliverd succesfully!' );
        //here we providing aknowladgement to the user
        // console.log('message deliverd succesfully!' , message);
    })
})

$sendlocationButton.addEventListener('click' , (e) => {
    e.preventDefault()
    //diable button while sending an location link
    $sendlocationButton.setAttribute('disabled' , 'disabled')
    //fetching user coordinates
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser!')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position );
        //here position is an object 
        
        
        socket.emit('sendLocation' , {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        } , (message) => {
            //inside callback
            //location aknowladgement
            $sendlocationButton.removeAttribute('disabled')
            console.log(message);
        })
    })
})



socket.emit('join', {username , room} , (error) => {
    //handling error which occure at joining time 
    if(error)
    {
        alert(error)
        //redirecting user to old page
        //we  redirect user to root page = join page 
        location.href = '/'
    }
})

//reciving an event
//it runs every time whent server sent something to client 
// socket.on('countUpdated' , (count) => {
//     console.log('count has been updated' + count);
// })

// document.querySelector('#increment').addEventListener('click' , () => {
//     console.log('clicked');
//     //sending an event to server
//     socket.emit('increment')
// })