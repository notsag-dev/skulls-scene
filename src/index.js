const THREE = require('three');
const {loadModels, models} = require('./models');

/**
 * Global THREE inits
 *
 */
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000,
);
camera.position.x = 300;
const lookAt = new THREE.Vector3(200, 0, 0);
camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
const rotationAxis = new THREE.Vector3(0, 1, 0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Audio
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new window.AudioContext();
const gainNode = context.createGain();

const sceneObjects = [];
const positions = [];

/**
 * Render function. Executed every frame.
 *
 */
const render = () => {
  renderer.render(scene, camera);
};

/**
 * Animation function. Executed every frame.
 *
 */
const animate = () => {
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();
  requestAnimationFrame(animate);
  const scale = (Math.sin(elapsedTime) + (Math.cos(elapsedTime + 2)) ** 2) ** 2 + 0.3;
  for (let i = 0; i < sceneObjects.length; i++) {
    const obj = sceneObjects[i];
    obj.rotation.x += delta;
    obj.rotation.y += delta;
    obj.rotation.z += delta;

    obj.scale.set(scale, scale, scale);
  }

  lookAt.applyAxisAngle(rotationAxis, delta / 3);
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

  gainNode.gain.value = scale / 8;
  render();
};

/**
 * Init audio: start mp3, oscilator.
 *
 */
const initAudio = () => {
  const audio = new Audio();
  audio.src = '/assets/sounds/laugh.mp3';
  audio.controls = true;
  audio.autoplay = true;
  audio.loop = true;
  const source = context.createMediaElementSource(audio);
  const oscillatorNode = context.createOscillator();
  gainNode.gain.value = 0;
  oscillatorNode.connect(gainNode);
  oscillatorNode.frequency.value = 110;
  oscillatorNode.start();
  source.connect(gainNode);
  gainNode.connect(context.destination);
}

/**
 * Populate scene: load model and add skulls to scene.
 *
 */
const populateScene = async () => {
  await loadModels();
  const mat = new THREE.MeshNormalMaterial();

  for (let i = 0; i < models.skull.children.length; i++) {
    models.skull.children[i].material = mat;
  }
  let indPos = 0;
  for (let x = -1000; x <= 0; x += 500) {
    for (let y = -1000; y <= 1000; y += 500) {
      for (let z = -1000; z <= 1000; z += 500) {
          const mesh = models.skull.clone();
          mesh.position.set(x, y, z);
          scene.add(mesh);
          sceneObjects.push(mesh);
          positions[indPos] = new THREE.Vector3(x, y, z);
          indPos += 1;
      }
    }
  }
}

/**
 * Scene init: load models, populate scene, init audio.
 *
 */
const init = async () => {
  await populateScene();
  initAudio();
  animate();
};


init();
