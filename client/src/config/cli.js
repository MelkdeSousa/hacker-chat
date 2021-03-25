const PRODUCTION_URL = process.env.PRODUCTION_URL

export default class CLI {
  constructor({ username, room, host = PRODUCTION_URL }) {
    this.username = username
    this.room = room

    const { protocol, hostname, port } = new URL(host)

    this.protocol = protocol.replace(/\W/, '')
    this.hostname = hostname
    this.port = port
  }

  static parseArgs(args) {
    const commands = new Map()

    for (const key in args) {
      const index = parseInt(key)
      const command = args[key]

      const commandPrefix = '--'

      if (!command.includes(commandPrefix)) continue

      commands.set(command.replace(commandPrefix, ''), args[index + 1])
    }

    return new CLI(Object.fromEntries(commands))
  }
}
