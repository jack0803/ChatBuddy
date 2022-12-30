//making an reusable function

const generateMessage = (username,text) => {
    return {
        username: username,
        text: text, 
        createdAt :new Date().getTime()
    }
}   


const generateLocationMessage = (username , coords) => {
    return {
        username : username,
        url: `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`, 
        createdAt :new Date().getTime()
    }
}  

export  {
    generateMessage,
    generateLocationMessage 
}