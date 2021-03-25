#!/usr/bin/env node

import Events from 'events'
import CLIConfig from './src/config/cli.js'
import TerminalController from './src/controllers/terminal.js'
import SocketClient from './src/socket.js'
import EventManager from './src/eventManager.js'

const [, , ...args] = process.argv
const configCLI = CLIConfig.parseArgs(args)

const socketClient = new SocketClient(configCLI)
await socketClient.initialize()

const componentEmitter = new Events()
const controller = new TerminalController()
await controller.initializeTable(componentEmitter)

const { room, username } = configCLI

const eventManager = new EventManager({ componentEmitter, socketClient })
const events = eventManager.getEvents()

socketClient.attachEvents(events)

eventManager.joinRoomAndWaitForMessages({ room, username })
