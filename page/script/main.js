const title = 'monogatari_01';
const videoServer = 'https://lam.lpsub.com:2087/NOTPT';
const videoListURL = `${videoServer}/${title}/list.json`;
const wss = 'ws://localhost:14514';

function GetRequest(urlStr) {
    if (typeof urlStr == "undefined") {
        var url = decodeURI(location.search); //获取url中"?"符后的字符串
    } else {
        var url = "?" + urlStr.split("?")[1];
    }
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

var vid

const keys_url = Object.keys({})
if ( Object.keys(GetRequest()).includes('key') ) {
    vid = GetRequest()['key'];
} else {
    vid = uuid();
}


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
