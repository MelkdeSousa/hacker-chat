import { events } from './constants.js'

export default class Controller {
  #users = new Map()
  #rooms = new Map()

  constructor({ socketServer }) {
    this.socketServer = socketServer
  }

  onNewConnection(socket) {
    const { id } = socket

    console.log('connect successfully with: ', id)

    const userData = { id, socket }

    this.#updateGlobalUserData(id, userData)

    socket.on('data', this.#onSocketData(id))
    socket.on('error', this.#onSocketClosed(id))
    socket.on('end', this.#onSocketClosed(id))
  }

  broadcast({
    socketId,
    roomId,
    event,
    message,
    includeCurrentSocket = false,
  }) {
    const usersOnRoom = this.#rooms.get(roomId)

    for (const [key, user] of usersOnRoom) {
      if (!includeCurrentSocket && key === socketId) continue

      this.socketServer.sendMessage(user.socket, event, message)
    }
  }

  async joinRoom(socketId, data) {
    const userData = data

    const user = this.#updateGlobalUserData(socketId, userData)

    const { room: roomId } = userData

    console.log(`${[socketId]}: ${userData.username} joined in ${roomId}!`)

    const users = this.#joinUserOnRoom(roomId, user)

    const currentUsers = Array.from(users.values()).map(user => ({
      ...user,
    }))

    this.socketServer.sendMessage(
      user.socket,
      events.UPDATE_USERS,
      currentUsers
    )

    this.broadcast({
      socketId,
      roomId,
      message: {
        id: socketId,
        username: userData.username,
      },
      event: events.NEW_USER_CONNECTED,
    })
  }

  message(socketId, data) {
    const { username, room: roomId } = this.#users.get(socketId)

    this.broadcast({
      roomId,
      socketId,
      event: events.MESSAGE,
      message: {
        username,
        message: data,
      },
      includeCurrentSocket: true,
    })
  }

  #joinUserOnRoom(roomId, user) {
    const usersOnRoom = this.#rooms.get(roomId) ?? new Map()
    usersOnRoom.set(user.id, user)
    this.#rooms.set(roomId, usersOnRoom)

    return usersOnRoom
  }

  #logoutUser(id, roomId) {
    this.#users.delete(id)

    const usersOnRoom = this.#rooms.get(roomId)
    usersOnRoom.delete(id)

    this.#rooms.set(roomId, usersOnRoom)
  }

  #onSocketClosed(id) {
    return _ => {
      const { username, room: roomId } = this.#users.get(id)

      console.log(`${id}: ${username} disconnected`)

      this.#logoutUser(id, roomId)

      this.broadcast({
        roomId,
        message: {
          id,
          username,
        },
        socketId: id,
        event: events.DISCONNECT_USER,
      })
    }
  }

  #onSocketData(id) {
    return data => {
      try {
        const { event, message } = JSON.parse(data)

        this[event](id, message)
      } catch (error) {
        console.error('wrong event format', data.toString(), error)
      }
    }
  }

  #updateGlobalUserData(socketId, userData) {
    const users = this.#users
    const user = users.get(socketId) ?? {}

    const updatedUserData = {
      ...user,
      ...userData,
    }

    users.set(socketId, updatedUserData)

    return users.get(socketId)
  }
}
