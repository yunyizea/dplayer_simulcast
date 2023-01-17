const WebScoket = require('ws')

const wss = new WebScoket.Server({ port: 14514 })

let cache = {};
let device = [];

wss.addListener('connection', (wsc, req) => {
    const cip = req.socket.remoteAddress;
    const cport = req.socket.remotePort;

    log(`客户端发起连接`, `${cip}:${cport}`);

    device.push(wsc);
    wsc.on('message', (message) => {
        try {
            let msg = JSON.parse(message);

            if (msg.id === '') {
                return;
            }

            if (msg.command === 'upload') {
                cache[msg.id] = {
                    status: 0,
                    vid: msg.id,
                    vURL: msg.videoURL,
                    vstatus: msg.paused ? 'paused' : 'play',
                    playbackProgress: msg.playbackProgress
                }

                device.forEach(_wsc => {
                    if (_wsc !== wsc) {
                        _wsc.send(JSON.stringify(cache[msg.id]));
                    }
                })
                log(`上传数据, ID'${msg.id}'的数据已缓存.`, `${cip}:${cport}`);
            }

            if (msg.command === 'get') {
                if (cache[msg.id]) {
                    cache[msg.id].status = 1;
                    wsc.send(JSON.stringify(cache[msg.id]));
                    log(`请求所有数据, ID'${msg.id}'的缓存数据已发送.`, `${cip}:${cport}`);
                } else {
                    wsc.send(JSON.stringify({
                        status: -1,
                        msg: '此ID在缓存中不存在数据'
                    }));
                    log(`请求所有数据, 但是ID'${msg.id}'的缓存数据不存在.`, `${cip}:${cport}`);
                }
            }
        } catch (e) {
            log(`回传数据不合法!\n${e}`, `${cip}:${cport}`);
        }
    })
})

function log(msg, ipp, ...args) {
    console.log(`[${new Date().toTimeString().substr(0, 8)} - IP:[${ipp}]]: ${msg}`, ...args)
}

console.log(`\nWebSocket服务器启动在 ws://localhost:14514/ 上。\n`);