const express = require('express')
const http = require('http')

//For signalling in WebRTC
const { Server } = require('socket.io')

const app = express()

app.use(express.static('public'))


app.get('/', function(req, res) {
	res.render('main.ejs')
})

app.get('/caller', function (req, res) {
	res.render('caller.ejs')
})


app.get('/callee', function (req, res) {
	res.render('callee.ejs')
})

const server = http.createServer(app)

server.listen(process.env.PORT || 8000)

const io = new Server(server)

let caller = []
let callee = []

let currentOffer = null

function webRTC(io) {
	io.on('connection', socket => {
		console.log('Socket Connected', socket.id)

		socket.on('join', room => {
			if (room == 'caller') {
				socket.join(room)
				caller.push(socket.id)
			} else if (room == 'callee') {
				socket.join(room)
				callee.push(socket.id)
				
				io.to('caller').emit('callee-joined')
			} else {
				throw new Error('Neither Caller and Callee')
			}
			console.log(socket.id, 'is', room)
		})

		socket.on('offer', offer => {
			console.log('Offer', offer != null)
			currentOffer = offer
			io.sockets.emit('offer', offer)
		})

		socket.on('answer', answer => {
			console.log('Answer', answer != null)
			io.sockets.emit('answer', answer)
		})

		socket.on('candidate', candidate => {
			console.log('Candidate', candidate != null)
			if (caller.includes(socket.id) == true) {
				io.to('callee').emit('candidate', candidate)
			} else if (callee.includes(socket.id) == true) {
				io.to('caller').emit('candidate', candidate)
			}
		})

		socket.on('disconnect', () => {
			console.log('Socket Disconnected', socket.id)
		})
	})
}

webRTC(io)
