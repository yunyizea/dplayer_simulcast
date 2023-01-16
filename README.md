# 一个关于dplayer的同步播放的简单实现

## 使用方法
```bash
# 首先安装好node
# 使用npm命令进行依赖安装
npm install
# 然后启动ws服务器
npm run wsserver

# 然后把page文件夹里的文件放到前端环境里面
# NGINX Apache2 Node_http_server FiveServer等
```

---

## 时序流程
websocket服务器(wss)启动 -> 前端页面第一次连接wss，wss创建缓存 -> loop: dplayer事件监听 -> {暂停事件： 前端上报暂停事件，wss向其他client广播暂停事件；进度条事件：前端上报进度条事件，wss向其他client广播事件} -> 收到广播，将监听事件设置正忙(busy)，防止出现泛洪 -> 前端对接收到的广播包进行相应操作 :loop

---

## 技术栈
- websocket
- js