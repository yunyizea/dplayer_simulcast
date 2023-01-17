const videoURL = 'https://video.yunyize.com:8000/%E4%B8%89%E7%94%9F%E4%B8%89%E4%B8%96%E6%9E%95%E4%B8%8A%E4%B9%A6/%E4%B8%89%E7%94%9F%E4%B8%89%E4%B8%96%E6%9E%95%E4%B8%8A%E4%B9%A6.EP01.2020.HD1080P.X264.AAC.Mandarin.CHS.Mp4Ba.mp4';
const wss = 'ws://localhost:14514';
const vid = '1871e5db4cd13';

const dp = new DPlayer({
    container: document.querySelector('#videoContainer'),
    video: {
        url: videoURL,
    },
});

const wsc = new WebSocket(wss);

let autoPlay = true;
let busy = false;

wsc.onmessage = message => {
    let data = JSON.parse(message.data);

    if (data.status === -1) {
        sender();
        return;
    }

    busy = true;

    data.vstatus === 'paused' ? dp.pause() : dp.play();
    dp.seek(data.playbackProgress);

    setTimeout(() => {
        busy = false;
    }, 250);
}

wsc.onopen = () => {
    getter();
}

dp.on('pause', () => {
    if (busy) return;
    sender();
})

dp.on('play', () => {
    if (busy) return;
    sender();
})

dp.on('seeked', () => {
    if (busy) return;
    sender();
})

function getter() {
    wsc.send(JSON.stringify({
        id: vid,
        command: 'get',
    }));
}

function sender() {
    wsc.send(JSON.stringify({
        id: vid,
        command: 'upload',
        paused: dp.video.paused,
        playbackProgress: dp.video.currentTime,
    }));
}