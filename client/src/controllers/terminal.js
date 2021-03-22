import ComponentsBuilder from '../components.js'
import { app } from '../constants.js'

export default class Terminal {
  #usersColors = new Map()

  constructor() {}

  #pickColor() {
    return `#${(((1 << 24) * Math.random()) | 0).toString(16)}-fg`
  }

  #getUserColor(username) {
    if (this.#usersColors.has(username)) return this.#usersColors.get(username)

    const color = this.#pickColor()
    this.#usersColors.set(username, color)

    return color
  }

  #onInputReceived(eventEmitter) {
    return function () {
      const message = this.getValue()
      console.log(message)
      this.clearValue()
    }
  }

  #onMessageReceived({ screen, chat }) {
    return ({ message, username }) => {
      const color = this.#getUserColor(username)

      chat.addItem(`{${color}}{bold}${username}{/}: ${message}`)
      screen.render()
    }
  }

  #onLogChanged({ screen, activityLog }) {
    return message => {
      const [username] = message.split(/\s/)
      const color = this.#getUserColor(username)

      activityLog.addItem(`{${color}}{bold}${message.toString()}{/}`)

      screen.render()
    }
  }

  #onStatusChanged({ screen, status }) {
    return users => {
      const { content } = status.items.shift()

      status.clearItems()
      status.addItem(content)

      users.forEach(username => {
        const color = this.#getUserColor(username)
        status.addItem(`{${color}}{bold}${username}{/}`)
      })

      screen.render()
    }
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on(app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
    eventEmitter.on(app.ACTIVITY_LOG_UPDATE, this.#onLogChanged(components))
    eventEmitter.on(app.STATUS_UPDATE, this.#onStatusChanged(components))
  }

  async initializeTable(eventEmitter) {
    const components = new ComponentsBuilder()
      .setScreen({ title: 'Hacker Chat' })
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setStatusComponent()
      .setActivityLogComponent()
      .build()

    this.#registerEvents(eventEmitter, components)

    components.input.focus()
    components.screen.render()
  }
}
