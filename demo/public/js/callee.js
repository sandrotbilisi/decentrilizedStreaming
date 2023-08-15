var socket = io.connect()
var callee

socket.on('offer', offer => {
	console.log(offer)
	callee.setRemoteDescription(offer)
	makeAnswer()
})

socket.on('candidate', (candidate) => {
	console.log(candidate)
	callee.addIceCandidate(candidate)
})

function sendAnswer(answer) {
	socket.emit('answer', answer)
}
function sendCandidate(candidate) {
  console.log("sending candidate", candidate)
	socket.emit('candidate', candidate)
}
function makePeerConnection() {
	callee = new RTCPeerConnection(RTC_CONFIGURATION)
	const screenEl = document.querySelector('#screen')
	callee.onaddstream = event => {
		screenEl.srcObject = event.stream
	}
	callee.onicecandidate = event => {
		if (event.candidate != null) {
			sendCandidate(event.candidate)
		}
	}
}
function makeAnswer() {
	callee
		.createAnswer()
		.then(answer => {
			return callee.setLocalDescription(answer)
		})
		.then(() => {
			sendAnswer(callee.localDescription)
		})
}

window.addEventListener('DOMContentLoaded', () => {
  socket.emit('join', 'callee')
  makePeerConnection()
})
