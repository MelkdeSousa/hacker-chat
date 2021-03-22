import Events from 'events'
import TerminalController from './src/controllers/terminal.js'

const componentEmitter = new Events()
const controller = new TerminalController()

await controller.initializeTable(componentEmitter)
