/* DEPENDENCIES */
import Phaser from 'phaser';
import * as Tone from 'tone';
import Manager3D from './views/Manager3D';

/* * SCENE MODULES * */
import MainInterface from './views/MainInterface';
import InputHandler from './components/manager/InputHandler';

const target: HTMLCanvasElement = document.getElementById('phase') as HTMLCanvasElement;

document.addEventListener('DOMContentLoaded', () => {

  // --- Tone.js ---
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
    
    window.addEventListener('click', () => {
      Tone.start();
      
      backgroundNoise.start();
      fadeInStatic();
    });

  // --- Three.js ---
  const threeMan = new Manager3D();

  // --- Phaser 3 ---
  const phaserConfig = {
    type: Phaser.WEBGL,
    canvas: target,
    antialias: true,
    antialiasGL: true,
    physics: {
      default: 'matter',
      matter: {
        debug: true,
        gravity: { x: 0, y: 0 },

        // @ts-ignore - false error due to incomplete type declarations in Phaser;
        plugins: {
          attractors: true
        }
      }
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    transparent: true,
    disableContextMenu: true,
  };

  const mainUI = new Phaser.Game(phaserConfig);
  mainUI.scene.add('InputHandler', InputHandler);
  mainUI.scene.add('MainInterface', MainInterface);

  const clientConfig = {};
  const controlConfig = {};

  mainUI.scene.run('InputHandler', controlConfig);
  mainUI.scene.run('MainInterface', clientConfig);
});

export const phaseCanvas = target;

// TODO: Add DTMF Tone Generator
// TODO: Setup IndexedDB
// TODO: Setup Sensors Permissions and switches
// TODO: Setup IPFS user look-up directory
