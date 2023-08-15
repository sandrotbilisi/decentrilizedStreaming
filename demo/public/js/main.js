import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

const screenEl = document.querySelector('#screen')

function Scene({ joinStream }) {
	const params = {
		bloomStrength: 1.5,
		bloomThreshold: 0,
		bloomRadius: 0.3,
	}

	const BLOOM_SCENE = 1

	const bloomLayer = new THREE.Layers()
	bloomLayer.set(BLOOM_SCENE)

	// Canvas
	const canvas = document.querySelector('.webgl')

	const fogColor = '#00000D'

	// Scene
	const scene = new THREE.Scene()
	scene.fog = new THREE.Fog(fogColor, 0.1, 15)

	const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
	directionalLight.position.set(1, 1, 0)
	directionalLight.lookAt(new THREE.Vector3())
	scene.add(directionalLight)

	const ambientLight = new THREE.AmbientLight('#fcf98b', 2)
	scene.add(ambientLight)

	const videoTexture = new THREE.VideoTexture(screenEl)

	let cinema = {}

	/**
	 * Sizes
	 */
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	}

	const raycaster = new THREE.Raycaster()

	const mouse = new THREE.Vector2()

	window.addEventListener('pointerdown', onPointerDown)

	window.addEventListener('resize', () => {
		// Update sizes
		sizes.width = window.innerWidth
		sizes.height = window.innerHeight

		// Update camera
		camera.aspect = sizes.width / sizes.height
		camera.updateProjectionMatrix()

		// Update renderer
		renderer.setSize(sizes.width, sizes.height)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		bloomComposer.setSize(sizes.width, sizes.height)
		finalComposer.setSize(sizes.width, sizes.height)
	})

	function onPointerDown(event) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

		raycaster.setFromCamera(mouse, camera)
		const intersects = raycaster.intersectObjects(scene.children, false)

		if (intersects.length > 0) {
			const object = intersects[0].object

			joinStream(object)
		}
	}

	/**
	 * Camera
	 */
	// Base camera
	const camera = new THREE.PerspectiveCamera(
		75,
		sizes.width / sizes.height,
		0.1,
		100
	)
	camera.position.set(0, 0.5, 2)
	camera.lookAt
	scene.add(camera)

	// Controls
	const controls = new OrbitControls(camera, canvas)
	controls.enableDamping = true
	controls.enabled = true
	// controls.addEventListener('change', e => {
	// 	console.log('controls change', controls.object.position)
	// })

	/**
	 * Renderer
	 */
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true,
	})
	// renderer.shadowMap = true
	renderer.setClearColor(fogColor)
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

	const renderScene = new RenderPass(scene, camera)

	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(sizes.width, sizes.height),
		1.5,
		0.4,
		0.85
	)

	bloomPass.threshold = params.bloomThreshold
	bloomPass.strength = params.bloomStrength
	bloomPass.radius = params.bloomRadius

	const bloomComposer = new EffectComposer(renderer)
	bloomComposer.renderToScreen = true
	bloomComposer.addPass(renderScene)
	bloomComposer.addPass(bloomPass)

	const finalPass = new ShaderPass(
		new THREE.ShaderMaterial({
			uniforms: {
				baseTexture: { value: null },
				bloomTexture: { value: bloomComposer.renderTarget2.texture },
			},
			vertexShader: `
		  varying vec2 vUv;
	
		  void main() {
	
			vUv = uv;
	
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	
		  }
		`,
			fragmentShader: `
		  uniform sampler2D baseTexture;
		  uniform sampler2D bloomTexture;
	
		  varying vec2 vUv;
	
		  void main() {
	
			gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
	
		  }
		`,
			defines: {},
		}),
		'baseTexture'
	)
	finalPass.needsSwap = true

	const finalComposer = new EffectComposer(renderer)
	finalComposer.addPass(renderScene)
	finalComposer.addPass(finalPass)

	function initCubes(streams) {
		const numOfCubes = streams.length
		const columns = 3

		const cubeGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25)

		const totalRows = Math.floor(numOfCubes / columns)

		for (let i = 0; i < numOfCubes; i++) {
			const row = Math.floor(i / columns)
			const col = i % columns
			const stream = streams[i]

			const coords = {
				x: col - Math.floor(columns / 2) + Math.random(),
				y: Math.random() * 0.5 - 0.5,
				z: row + Math.random() - totalRows * 0.8,
			}

			const color = new THREE.Color()

			color.setHSL(Math.random(), 1, Math.random() * 0.2 + 0.05)

			const cubeMaterial = new THREE.MeshStandardMaterial({
				color: color,
			})

			const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
			cube.position.set(coords.x, coords.y, coords.z)
			cube.layers.toggle(BLOOM_SCENE)
			cube.userData = stream
			scene.add(cube)
		}
	}

	function initCinema() {
		const group = new THREE.Group()

		const tv = new THREE.Mesh(
			new THREE.PlaneGeometry(3.5, 2.5),
			new THREE.MeshBasicMaterial({ color: 'white', map: videoTexture })
		)

		tv.position.set(0, 1, -1)

		const floor = new THREE.Mesh(
			new THREE.PlaneGeometry(1.5, 1.5),
			new THREE.MeshBasicMaterial({ color: 'grey' })
		)

		floor.rotation.x = -Math.PI * 0.5
		floor.position.y = -0.5

		group.add(tv, floor)
		scene.add(group)

		group.position.y = -5

		return {
			tv,
			group,
		}
	}

	/**
	 * Animate
	 */
	const clock = new THREE.Clock()

	const tick = () => {
		const elapsedTime = clock.getElapsedTime()

		// Update controls
		controls.update()

		// Render
		renderer.render(scene, camera)
		// bloomComposer.render()
		// finalComposer.render()

		// Call tick again on the next frame
		window.requestAnimationFrame(tick)
	}

	cinema = initCinema()
	// initCubes()

	// bloomComposer.render()
	// scene.traverse(darkenNonBloomed)

	// function darkenNonBloomed(obj) {
	// 	if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
	// 		obj.material = darkMaterial
	// 	}
	// }

	tick()

	// const helper = new THREE.CameraHelper(camera)
	// scene.add(helper)

	function moveCamera() {
		const vector = new THREE.Vector3(0, -4.5, 0)

		controls.target = vector

		gsap.to(camera.position, {
			duration: 1,
			x: vector.x,
			y: vector.y,
			z: 2,
			onUpdate: function () {
				// camera.lookAt( center );
			},
		})

		controls.update()

		// bloomComposer.enabled = false
	}

	return {
		createStream() {
			moveCamera()
		},
		moveCamera,
		addCubes: streams => {
			initCubes(streams)
		},
	}
}

function App() {
	const web3 = new Web3('https://data-seed-prebsc-2-s1.binance.org:8545')

	let account = null

	const contractAddress = '0x2B06C175BEcac69285d591Fd9723104d618dDCcd'

	web3.eth.setProvider(Web3.givenProvider)

	const liveStreamingContract = new web3.eth.Contract(
		LIVE_STREAM_ABI,
		contractAddress
	)

	let joinAllowed = false

	const scene = Scene({ joinStream: initCallee })

	// get the contract instance and the account
	window.ethereum
		.request({ method: 'eth_requestAccounts' })
		.then(async accounts => {
			if (accounts[0]) {
				account = accounts[0]
				const cubes = await showActiveStreams()
				scene.addCubes(cubes)
			}
		})

	const socket = io.connect()

	const createStreamBtn = document.querySelector('#create_stream')
	const joinStreamBtn = document.querySelector('#join_stream')
	const introButtons = document.querySelector('#intro_buttons')
	const createModalBtn = document.querySelector('#create_modal_btn')

	// do something to transition the buttons up
	const modal = new bootstrap.Modal('#createStreamModal', {})

	let currentStream
	let connection = null

	const hideButtons = () => {
		introButtons.classList.add('hide')
	}

	// CALLER
	createStreamBtn.addEventListener('click', () => {
		modal.show()

		scene.createStream()
	})

	createModalBtn.addEventListener('click', async () => {
		const fee = document.querySelector('#stream_fee').value

		modal.hide()

		hideButtons()

		const resp = await liveStreamingContract.methods
			.createStream(fee)
			.send({ from: account })

		initCaller()
	})

	// CALLEE
	joinStreamBtn.addEventListener('click', () => {
		// do something to transition the buttons up
		joinAllowed = true
		hideButtons()
	})

	socket.on('candidate', candidate => {
		connection.addIceCandidate(candidate)
	})

	function sendAnswer(answer) {
		socket.emit('answer', answer)
	}

	function sendOffer(offer) {
		socket.emit('offer', offer)
	}

	function sendCandidate(candidate) {
		socket.emit('candidate', candidate)
	}

	function getStream() {
		return new Promise((resolve, reject) => {
			navigator.mediaDevices
				.getUserMedia({ audio: false, video: true })
				.then(mediaStream => {
					resolve(mediaStream)
				})
		})
	}

	function initCallerConnection() {
		connection = new RTCPeerConnection(RTC_CONFIGURATION)

		connection.addStream(currentStream)

		connection.onicecandidate = event => {
			if (event.candidate != null) {
				sendCandidate(event.candidate)
			}
		}

		socket.on('answer', answer => {
			connection.setRemoteDescription(answer)
		})

		// makeOffer
		connection
			.createOffer()
			.then(offer => {
				connection.setLocalDescription(offer)
				return offer
			})
			.then(offer => {
				console.log('offer sent', offer)
				sendOffer(offer)
			})
	}

	function initCaller() {
		socket.emit('join', 'caller')

		getStream().then(stream => {
			screenEl.srcObject = stream
			currentStream = stream

			socket.on('callee-joined', () => {
				initCallerConnection()
			})
		})
	}

	function makeAnswer() {
		connection
			.createAnswer()
			.then(answer => {
				connection.setLocalDescription(answer)
				console.log('answer made', answer)
				return answer
			})
			.then(answer => {
				console.log()
				sendAnswer(answer)
			})
	}

	async function initCallee(cube) {
		if (!joinAllowed) return

		const stream = cube.userData;

		// Call the joinStream function in the smart contract to join the stream
		// const binanceAPIURL = 'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT';
		// const response = await axios.get(binanceAPIURL);
		// const BNBusdPrice = response.data.price;
		// const BNBAmount = stream.watchFee / BNBusdPrice;

		await liveStreamingContract.methods
			.joinStream(stream.StreamID)
			.send({ from: account, value: 29815146094215865, gas: 260000 })

		initCaller()

		scene.moveCamera()

		connection = new RTCPeerConnection(RTC_CONFIGURATION)

		connection.onaddstream = event => {
			screenEl.srcObject = event.stream
		}

		connection.onicecandidate = event => {
			if (event.candidate != null) {
				sendCandidate(event.candidate)
			}
		}

		socket.on('offer', offer => {
			console.log(offer)
			if (!connection.remoteDescription) {
				console.log('offer applied')
				connection.setRemoteDescription(offer)
				makeAnswer()
			}
		})

		socket.emit('join', 'callee')
	}

	async function showActiveStreams() {
		try {
			const streamIds = await liveStreamingContract.methods
				.getStreamIds()
				.call()

			const activeStreams = []

			// Get all active streams
			for (let i = 0; i < streamIds.length; i++) {
				const stream = await liveStreamingContract.methods
					.getStreamByID(streamIds[i])
					.call()

				activeStreams.push(stream)
			}

			return activeStreams
		} catch (error) {
			console.error(error.message)
		}
	}
}

window.addEventListener('DOMContentLoaded', App())
