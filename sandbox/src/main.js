import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import * as dat from 'lil-gui'

const cubeTextureLoader = new THREE.CubeTextureLoader()

const gui = new dat.GUI()

const params = {
	bloomStrength: 1.5,
	bloomThreshold: 0,
	bloomRadius: 0.3,
}

// Canvas
const app = document.querySelector('#app')
const canvas = document.createElement('canvas')
canvas.classList.add('webgl')
app.appendChild(canvas)

const fogColor = '#00000D'

// Scene
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(fogColor, 0.1, 15)

const environmentMap = cubeTextureLoader.load([
	'/static/environmentMaps/space/px.png',
	'/static/environmentMaps/space/nx.png',
	'/static/environmentMaps/space/py.png',
	'/static/environmentMaps/space/ny.png',
	'/static/environmentMaps/space/pz.png',
	'/static/environmentMaps/space/nz.png',
])
environmentMap.encoding = THREE.sRGBEncoding

// scene.background = environmentMap
// scene.environment = environmentMap

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
directionalLight.lookAt(new THREE.Vector3())
scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight('#fcf98b', 2)
scene.add(ambientLight)

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	1000
)
camera.position.set(0, 0.5, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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
// bloomPass.enabled = false
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

const numOfCubes = 100
const columns = 10

const cubeGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25)

const totalRows = Math.floor(numOfCubes / columns)

for (let i = 0; i < numOfCubes; i++) {
	const row = Math.floor(i / columns)
	const col = i % columns

	const coords = {
		x: col - Math.floor(columns / 2) + Math.random(),
		y: Math.random() * 0.5 - 0.5,
		z: row + Math.random() - totalRows * 0.8,
	}

	const color = new THREE.Color()

	color.setHSL(Math.random(), 1, Math.random() * 0.2 + 0.05)

	const cubeMaterial = new THREE.MeshBasicMaterial({
		color: color,
		opacity: 1,
		// transparent: true,
	})

	const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
	cube.position.set(coords.x, coords.y, coords.z)
	scene.add(cube)
}

gui.add(bloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(bloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(bloomPass, 'threshold').min(0).max(1).step(0.001)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
	const elapsedTime = clock.getElapsedTime()

	// Update controls
	controls.update()

	// Render
	// renderer.render(scene, camera)
	bloomComposer.render()
	// finalComposer.render()

	// Call tick again on the next frame
	window.requestAnimationFrame(tick)
}

tick()
