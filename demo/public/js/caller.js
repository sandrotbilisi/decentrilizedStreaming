var socket = io.connect()
var currentStream
var caller

socket.on('answer', answer => {
	caller.setRemoteDescription(answer)
})

socket.on('candidate', candidate => {
	caller.addIceCandidate(candidate)
})

socket.on('callee-join', () => {
	if (currentStream) {
		makePeerConnection()
	}
})

function sendOffer(offer) {
	socket.emit('offer', offer)
}

function sendCandidate(candidate) {
	socket.emit('candidate', candidate)
}

function getStream() {
	return new Promise((resolve, reject) => {
		navigator.mediaDevices
			.getDisplayMedia({ audio: false, video: true })
			.then(mediaStream => {
				resolve(mediaStream)
			})
	})
}

function makePeerConnection() {
	caller = new RTCPeerConnection(RTC_CONFIGURATION)

	caller.addStream(currentStream)
	caller.onicecandidate = event => {
		if (event.candidate != null) {
			sendCandidate(event.candidate)
		}
	}

	// makeOffer
	caller
		.createOffer()
		.then(offer => {
			return caller.setLocalDescription(offer)
		})
		.then(() => {
			sendOffer(caller.localDescription)
		})
}

window.addEventListener('DOMContentLoaded', () => {
	socket.emit('join', 'caller')

	const shareBtn = document.querySelector('#share')
	const screenEl = document.querySelector('#screen')

	shareBtn.addEventListener('click', () => {
		getStream().then(stream => {
			screenEl.srcObject = stream
			currentStream = stream
		})
	})
})
