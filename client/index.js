import Events from 'events'
import CLIConfig from './src/config/cli.js'
import TerminalController from './src/controllers/terminal.js'
import SocketClient from './src/socket.js'

const [, , ...args] = process.argv
const configCLI = CLIConfig.parseArgs(args)

const socketClient = new SocketClient(configCLI)
await socketClient.initialize()

const componentEmitter = new Events()
const controller = new TerminalController()
await controller.initializeTable(componentEmitter)
