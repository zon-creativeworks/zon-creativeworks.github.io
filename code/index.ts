/* DEPENDENCIES */
import Phaser from 'phaser';
import * as Tone from 'tone';
import Manager2D from './views/Manager2D';
import MixedMediaView from './components/interface/base/MixedMediaView';

document.addEventListener('DOMContentLoaded', () => {

  // Boot up the UI with any initialized MMV scenes
  const UI = new Phaser.Game({
    type: Phaser.WEBGL,
    antialias: true,
    antialiasGL: true,
    transparent: true,
    customEnvironment: true,
    disableContextMenu: true,
    width: window.innerWidth,
    height: window.innerHeight,
    canvas: document.getElementById('phase') as HTMLCanvasElement,
    scene: [
      MixedMediaView
    ]
  });

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

    buttonClick = new Tone.Player('public/assets/audio/ButtonClick.wav');
    buttonClick.connect(buttonClick_vol);

    capacitorChargeUp = new Tone.Player('public/assets/audio/TVCapCharge.wav');
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
  
  // --- Three.js | UI Layers ---
  const manager2D = new Manager2D();
});

// TODO: Add DTMF Tone Generator
// TODO: Setup IndexedDB
// TODO: Setup Sensors Permissions and switches
// TODO: Setup IPFS user look-up directory
