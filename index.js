const ws = require('ws');

const wss = new ws.Server({
  port: 8080,
  perMessageDeflate: false
});

const state = {
    matrix: [],
    wheel: 128,
}

for (let i=0; i < 64; i++) {
    state.matrix.push(0);
}

function sendMatrix(client) {
    if (client.readyState === 1) {
        client.send(JSON.stringify({
            addr: '/matrix',
            matrix: state.matrix
        }));
    }
}

function sendWheel(client) {
    if (client.readyState === 1) {
        client.send(JSON.stringify({
            addr: '/wheel',
            value: state.wheel
        }));
    }
}


const dispatcher = {
    '/matrix': (m) => {
        console.log('matrix has been updated, broadcast changes to all clients')
        state.matrix = m.matrix
        wss.clients.forEach(function each(client) {    
            sendMatrix(client)
        });
    },
    '/wheel': (m) => {
        console.log('wheel has been updated, broadcast changes to all clients')
        state.wheel = m.value
        wss.clients.forEach(function each(client) {    
            sendWheel(client)
        });
    },
    '/get-matrix': (_, client) => { 
        console.log('send matrix to client')
        client.send(JSON.stringify({
            addr: '/matrix',
            matrix: state.matrix
        }))
    }
}

const clients = {}


wss.on('connection', function connection(ws, _, client) {
    console.log('client connected')
    ws.isAlive = true
    ws.on('ping', function () { console.log('ping received'); ws.send('pong'); ws.isAlive = true; })
    ws.on('pong', function () { console.log('pong received'); ws.isAlive = true; })
    console.log(client);
    setInterval(() => {
        ws.send('ping')
    }, 1000)
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        try {
            const m = JSON.parse(message)
            if (dispatcher[m.addr] !== undefined) dispatcher[m.addr](m, ws)
        } catch (e) {
            console.warn('Not a JSON message');
            console.log(e)
        }
    });

    sendMatrix(ws)
    sendWheel(ws)
});

console.log('listening on port 8080')