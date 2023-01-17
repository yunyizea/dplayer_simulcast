const title = '%E4%B8%89%E7%94%9F%E4%B8%89%E4%B8%96%E6%9E%95%E4%B8%8A%E4%B9%A6';
const videoServer = 'https://video.yunyize.com:8000';
const videoListURL = `${videoServer}/${title}/list.json`;
const wss = 'ws://localhost:14514';
const vid = '7afc9004fcef7'

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
                document.location.hash = data.list[i]
                sender(wsc)
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

            if (data.status === -1) {
                sender(wsc);
                return;
            }

            busy = true;

            data.vstatus === 'paused' ? dp.pause() : dp.play();
            dp.seek(data.playbackProgress);
            if (data.vURL !== document.location.hash.substring(1)) {
                document.location.hash = data.vURL
                dp.switchVideo({
                    url: `${videoServer}${data.vURL}`
                })
            }

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


function getter(_wsc) {
    _wsc.send(JSON.stringify({
        id: vid,
        command: 'get',
    }));
}

function sender(_wsc) {
    _wsc.send(JSON.stringify({
        id: vid,
        command: 'upload',
        paused: dp.video.paused,
        videoURL: document.location.hash.substring(1),
        playbackProgress: dp.video.currentTime,
    }));
}