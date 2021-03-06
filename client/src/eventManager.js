import { app, socket } from './constants.js'

export default class EventManager {
  #allUsers = new Map()

  constructor({ componentEmitter, socketClient }) {
    this.componentEmitter = componentEmitter
    this.socketClient = socketClient
  }

  joinRoomAndWaitForMessages(data) {
    this.socketClient.sendMessage(socket.JOIN_ROOM, data)

    this.componentEmitter.on(app.MESSAGE_SEND, msg => {
      this.socketClient.sendMessage(socket.MESSAGE, msg)
    })
  }

  updateUsers(users) {
    const connectedUsers = users
    connectedUsers.forEach(({ id, username }) =>
      this.#allUsers.set(id, username)
    )
    this.#updateUsersComponent()
  }

  message(message) {
    this.#emitComponentUpdate(app.MESSAGE_RECEIVED, message)
  }

  disconnectUser(user) {
    const { id, username } = user

    this.#allUsers.delete(id)

    this.#updateActivityLogComponent(`${username} left!`)
    this.#updateUsersComponent()
  }

  newUserConnected(message) {
    const user = message
    this.#allUsers.set(user.id, user.username)

    this.#updateUsersComponent()
    this.#updateActivityLogComponent(`${user.username} joined!`)
  }

  #updateActivityLogComponent(message) {
    this.#emitComponentUpdate(app.ACTIVITY_LOG_UPDATE, message)
  }

  #emitComponentUpdate(event, message) {
    this.componentEmitter.emit(event, message)
  }

  #updateUsersComponent() {
    this.#emitComponentUpdate(
      app.STATUS_UPDATE,
      Array.from(this.#allUsers.values())
    )
  }

  getEvents() {
    const functions = Reflect.ownKeys(EventManager.prototype)
      .filter(fn => fn !== 'constructor')
      .map(name => [name, this[name].bind(this)])

    return new Map(functions)
  }
}
