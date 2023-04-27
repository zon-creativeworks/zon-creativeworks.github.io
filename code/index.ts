/* DEPENDENCIES */
import Phaser from 'phaser';
import * as Tone from 'tone';

/* * SCENE MODULES * */
import MainInterface from './views/MainInterface';
import InputHandler from './components/manager/InputHandler';

/* * GLOBAL CANVAS REFS * */
export const threeCanvas: HTMLCanvasElement = document.getElementById('three') as HTMLCanvasElement;
export const phaseCanvas: HTMLCanvasElement = document.getElementById('phase') as HTMLCanvasElement;
export const bezel = 13;

const overlayEl = document.getElementsByTagName('overlay')[0] as HTMLDivElement;

document.addEventListener('DOMContentLoaded', () => {

  const phaseUIConfig = {
    type: Phaser.WEBGL,
    canvas: phaseCanvas,
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

  // The Mandorla UI
  const mainUI = new Phaser.Game(phaseUIConfig);

  // Scene used only for requesting permissions and launching to fullscreen
  class ViewManager extends Phaser.Scene {
    constructor() {super('ViewManager')}
    init(): void { 
      this.cameras.main.centerOn(0, 0);

      // Sub-View Scenes
      mainUI.scene.add('InputHandler', InputHandler);
      mainUI.scene.add('MainInterface', MainInterface);
    }

    create(): void {
      const res = { w: window.innerWidth, h: window.innerHeight }
    }
  }
  mainUI.scene.add('ViewManager', ViewManager);
  mainUI.scene.run('ViewManager');

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


  // Start the app when the user clicks on the overlay
  const clickStart = () => {
    Tone.start();
    buttonClick.start();
    backgroundNoise.start();
    capacitorChargeUp.start();
    staticPop.start('+0.25');
    staticPop.stop('+0.50');
    fadeInStatic();

    // Immediately remove the inner div containing the click prompt
    overlayEl.innerHTML = '';

    // Remove the start-up click event
    removeClick();

    // TODO: Figure out how to keep things looking good in fullscreen...
    // Enable fullscreen
    // document.getElementById('app')?.requestFullscreen();

    // Fade-Out overlay / Fade-In MainInterface
    let baseOpacity = 1;
    const fadeIn = () => setTimeout(() => {
      overlayEl.style.opacity = `${baseOpacity}`;
      if (baseOpacity > 0) {
        baseOpacity -= 0.06;
        fadeIn();
      } else {
        overlayEl.remove();
        mainUI.scene.run('MainInterface');
      }
    }, 12);
    fadeIn();
  };
  let removeClick = () => {overlayEl.removeEventListener('pointerup', clickStart)};

  // First Interaction Inits
  document.addEventListener('pointerdown', () => Tone.start());

  // After Inits
  overlayEl.addEventListener('pointerup', clickStart);

});

console.debug(
  window['chrome'].app, 
  window['chrome'].app.getIsInstalled(), 
);
window['chrome'].app.installState((s) => { console.debug(s)})




// TODO: Add DTMF Tone Generator
// TODO: Setup IndexedDB
// TODO: Setup Sensors Permissions and switches
// TODO: Setup IPFS user look-up directory
// TODO: Setup Canvas Tile Composite to account for egregiously tall mobile device displays that distort 3D rendering
// TODO: Configure TiLLI animation to fade out when menu fades in;
// TODO: and configure menu to slide into the center of the viewport before opening
// TODO: Clean-up the tweens so they dont step over eachother; just one per animation sequence
