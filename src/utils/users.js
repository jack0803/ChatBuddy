
const users = []

// addUser, removeUser, getUser, getUsersInRoom

//-------------------------------------------------------------------->
const addUser = ({ id, username, room }) => {
    // Clean the data
    //removing space
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    //find in users array 
    //here user is an object(element) of users array
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}
//-------------------------------------------------------------------->
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        //here we remove an user from users array
        //in splice index = object that will remove , 1= no of items we like to remove ,  [0]=first object where we want to start from
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {

    return users.find((user) => user.id === id )
}

const getUsersInRoom  = (room) => {
    room = room.trim().toLowerCase()
    // filter will return true and false for each element
    return users.filter((user) =>  user.room === room)  
}

addUser({
    id: 22,
    username: 'Andrew  ',
    room: '  South Philly'
})

export {
    addUser, 
    getUser, 
    getUsersInRoom, 
    removeUser
}

// // const removedUser = removeUser(22)
// const userfounded = getUser(22)
// const userList = getUsersInRoom('South Philly')
// // console.log(removedUser)
// console.log(users)
// console.log(userfounded);
// console.log(userList);