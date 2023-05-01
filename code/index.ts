/* DEPENDENCIES */
import * as THREE from 'three';
import Phaser from 'phaser';
import * as Tone from 'tone';

/* * SCENE MODULES * */
// import MainInterface from './views/MainInterface';
// import InputHandler from './components/manager/InputHandler';

/* * GLOBAL CANVAS REFS * */
export const threeCanvas: HTMLCanvasElement = document.getElementById('three') as HTMLCanvasElement;
// export const phaseCanvas: HTMLCanvasElement = document.getElementById('phase') as HTMLCanvasElement;
// export const bezel = 13;

const overlayEl = document.getElementsByTagName('overlay')[0] as HTMLDivElement;

document.addEventListener('DOMContentLoaded', () => {

  // const phaseUIConfig = {
  //   type: Phaser.CANVAS,
  //   canvas: phaseCanvas,
  //   antialias: true,
  //   antialiasGL: true,
  //   physics: {
  //     default: 'matter',
  //     matter: {
  //       debug: true,
  //       gravity: { x: 0, y: 0 },
  //       // @ts-ignore - false error due to incomplete type declarations in Phaser;
  //       plugins: {
  //         attractors: true
  //       }
  //     }
  //   },
  //   scale: {
  //     mode: Phaser.Scale.RESIZE,
  //     autoCenter: Phaser.Scale.CENTER_BOTH,
  //   },
  //   transparent: true,
  //   disableContextMenu: true,
  // };

  // The Mandorla UI
  // const mainUI = new Phaser.Game(phaseUIConfig);

  // Scene used only for requesting permissions and launching to fullscreen
  // class ViewManager extends Phaser.Scene {
  //   constructor() {super('ViewManager')}
  //   init(): void { 
  //     this.cameras.main.centerOn(0, 0);

  //     // Sub-View Scenes
  //     mainUI.scene.add('InputHandler', InputHandler);
  //     mainUI.scene.add('MainInterface', MainInterface);
  //   }

  //   create(): void {
  //     const res = { w: window.innerWidth, h: window.innerHeight }
  //   }
  // }
  // mainUI.scene.add('ViewManager', ViewManager);
  // mainUI.scene.run('ViewManager');

    // Audio T-Base
    const now = Tone.now();

  // Background Static SFX
  let staticPop: Tone.Noise;
  let backgroundNoise: Tone.Noise;
  let buttonClick: Tone.Player;
  let capacitorChargeUp: Tone.Player;
  let fadeInStatic: any;

    // Volume Level Definitions
    const bgVolume = new Tone.Volume(-72).toDestination();
    const staticPop_vol = new Tone.Volume(-20).toDestination();
    const buttonClick_vol = new Tone.Volume(-3).toDestination();
    const capacitorChargeUp_vol = new Tone.Volume(-24).toDestination();

    // CRT TV Power-On | Start SFX
    backgroundNoise = new Tone.Noise('brown');
    backgroundNoise.connect(bgVolume);

    staticPop = new Tone.Noise('white');
    staticPop.connect(staticPop_vol);

    buttonClick = new Tone.Player('code/res/audio/ButtonClick.wav');
    buttonClick.connect(buttonClick_vol);

    capacitorChargeUp = new Tone.Player('code/res/audio/TVCapCharge.wav');
    capacitorChargeUp.connect(capacitorChargeUp_vol);
    
    // Fade-In background static from -100 dB to -24 dB over 0.5 seconds
    fadeInStatic = () => setTimeout(() => {
      let currentLevel = bgVolume.get().volume;
      if (currentLevel < -24) {
        bgVolume.set({volume: currentLevel + 2});
        fadeInStatic();
      }
    }, 1);

    // Basic ThreeJS Setup
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    renderer.setClearColor(0x000000, 0.90);

    const cCamera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1e-4, 1e4);

    const geo = new THREE.IcosahedronGeometry(2, 0);
    const flatWhite = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, reflectivity: 1.0 });
    const mesh = new THREE.Mesh(geo, flatWhite);
    mesh.position.set(0, 0, -10);

    scene.add(mesh);
    cCamera.lookAt(mesh.position);

    const render = () => {
      requestAnimationFrame(render);   // First

      mesh.rotation.y += 0.1;
      renderer.render(scene, cCamera); // Last
    };
    render();
});



// TODO: Add DTMF Tone Generator
// TODO: Setup IndexedDB
// TODO: Setup Sensors Permissions and switches
// TODO: Setup IPFS user look-up directory
