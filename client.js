const WebSocket = require('ws')

const ws = new WebSocket('ws://192.168.1.27:8080')

ws.on('open', () => {
    ws.send(JSON.stringify({
        addr: '/matrix'
    }))
})