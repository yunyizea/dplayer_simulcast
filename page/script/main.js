const title = '%E4%B8%89%E7%94%9F%E4%B8%89%E4%B8%96%E6%9E%95%E4%B8%8A%E4%B9%A6';
const videoServer = 'https://video.yunyize.com:8000';
const videoListURL = `${videoServer}/${title}/list.json`;
const wss = 'ws://localhost:14514';

const dp = new DPlayer({
    container: document.querySelector('#videoContainer'),
    video: {
        url: '',
    },
});

axios.get(videoListURL)

    .then(res => {
        if (res.status === 200) {
            return res.data;
        }
    })

    .then(data => {
        document.querySelector('#title').innerText = decodeURI(title)

        for (let i = 0; i < data.episodes; ++i) {
            const btn = document.createElement('div')
            btn.className = 'vBtn'
            btn.innerText = `第 ${i + 1} 集`;
            btn.addEventListener('click', () => {
                document.location.hash = md5(data.list[i]).substr(0, 8)
                getter(wsc);
                dp.switchVideo({
                    url: `${videoServer}${data.list[i]}`
                })
            })
            document.querySelector("#videoList").appendChild(btn);
        }



        const wsc = new WebSocket(wss);
        let busy = false;

        wsc.onmessage = message => {
            let data = JSON.parse(message.data);

            console.log(data);

            if (data.status === -1) {
                sender(wsc);
                return;
            }

            if (data.vid !== document.location.hash.substring(1)) {
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
            getter(wsc);
        }

        dp.on('pause', () => {
            if (busy) return;
            sender(wsc);
        })

        dp.on('play', () => {
            if (busy) return;
            sender(wsc);
        })

        dp.on('seeked', () => {
            if (busy) return;
            sender(wsc);
        })
    })


function getter(_wsc, _vid = document.location.hash.substring(1)) {
    _wsc.send(JSON.stringify({
        id: _vid,
        command: 'get',
    }));
}

function sender(_wsc, _vid = document.location.hash.substring(1)) {
    _wsc.send(JSON.stringify({
        id: _vid,
        command: 'upload',
        paused: dp.video.paused,
        playbackProgress: dp.video.currentTime,
    }));
}