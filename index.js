const ws = require('ws');

const wss = new ws.Server({
  port: 8080,
  perMessageDeflate: false
});

const dispatcher = {
    '/matrix': (m) => { console.log('do matrix stuff') },
}

const clients = {}


wss.on('connection', function connection(ws, _, client) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        const m = JSON.parse(message)
        if (dispatcher[m.addr] !== undefined) dispatcher[m.addr](m)
    });

    ws.send('something');
});

