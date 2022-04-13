// 1.express初始化app作为http服务器的回调函数
const app = require('express')()
const fs = require('fs')
const moment = require('moment')

// 2.通过传入http创建一个服务器
const http = require('http').createServer(app)

// 3.传入http对象初始化一个socket.io的实例
const io = require('socket.io')(http)

// 记录在线人数
let userNum = 0

// 5.读取index.html并展示
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

// 6.监听connection事件来接收socket
io.on('connection', socket => {
  userNum++
  io.emit('userNum', userNum)// 把当前在线人数提交给前端
  // 通过socket接收从前端传来的聊天信息
  socket.on('chat', message => {
    // console.log('接收前端传来的message：' + message)
    // 把chat事件发送给每一个用户，包括发送者本人
    // io.emit('chat', message)
    io.emit('chat', {
      userName: socket.userName,
      message: message,
      date: moment().format('LTS')
    })
  })

  // 用户进入聊天室
  socket.on('join', userName => {
    socket.userName = userName
    io.emit('join', {
      userName: userName,
      status: '进入'
    })
  })

  // 用户退出聊天室
  socket.on('disconnect', () => {
    if(userNum > 0) {
      userNum--
      io.emit('userNum', userNum)
      io.emit('join', {
        userName: socket.userName,
        status: '退出'
      })
    }
  })
})

// 4.监听启动服务器
http.listen(5000, () => {
  console.log('app start port 5000...')
})