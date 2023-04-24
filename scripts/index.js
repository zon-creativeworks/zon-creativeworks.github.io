"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bezel = exports.phaseCanvas = exports.threeCanvas = void 0;
const phaser_1 = require("phaser");
const Tone = require("tone");
const TiLLI_1 = require("./views/TiLLI");
const InputHandler_1 = require("./views/screens/InputHandler");
const SubstrateGrid_1 = require("./views/screens/SubstrateGrid");
const VisualDisplay_1 = require("./views/screens/VisualDisplay");
const MainInterface_1 = require("./components/interface/MainInterface");
exports.threeCanvas = document.getElementById('three');
exports.phaseCanvas = document.getElementById('phase');
exports.bezel = 13;
const overlayEl = document.getElementsByTagName('overlay')[0];
document.addEventListener('DOMContentLoaded', () => {
    const phaseUIConfig = {
        type: phaser_1.default.WEBGL,
        canvas: exports.phaseCanvas,
        antialias: true,
        antialiasGL: true,
        physics: {
            default: 'matter',
            matter: {
                debug: true,
                gravity: { x: 0, y: 0 },
                plugins: {
                    attractors: true
                }
            }
        },
        scale: {
            mode: phaser_1.default.Scale.RESIZE,
            autoCenter: phaser_1.default.Scale.CENTER_BOTH,
        },
        transparent: true,
        disableContextMenu: true,
    };
    const mainUI = new phaser_1.default.Game(phaseUIConfig);
    class ViewManager extends phaser_1.default.Scene {
        constructor() { super('ViewManager'); }
        init() {
            this.cameras.main.centerOn(0, 0);
            mainUI.scene.add('TiLLI', TiLLI_1.default);
            mainUI.scene.add('InputHandler', InputHandler_1.default);
            mainUI.scene.add('SubstrateGrid', SubstrateGrid_1.default);
            mainUI.scene.add('VisualDisplay', VisualDisplay_1.default);
            mainUI.scene.add('MainInterface', MainInterface_1.default);
        }
        create() {
            const res = { w: window.innerWidth, h: window.innerHeight };
        }
    }
    mainUI.scene.add('ViewManager', ViewManager);
    mainUI.scene.run('ViewManager');
    const now = Tone.now();
    let staticPop;
    let backgroundNoise;
    let buttonClick;
    let capacitorChargeUp;
    let fadeInStatic;
    const bgVolume = new Tone.Volume(-72).toDestination();
    const staticPop_vol = new Tone.Volume(-20).toDestination();
    const buttonClick_vol = new Tone.Volume(-3).toDestination();
    const capacitorChargeUp_vol = new Tone.Volume(-24).toDestination();
    backgroundNoise = new Tone.Noise('brown');
    backgroundNoise.connect(bgVolume);
    staticPop = new Tone.Noise('white');
    staticPop.connect(staticPop_vol);
    buttonClick = new Tone.Player('assets/audio/ButtonClick.wav');
    buttonClick.connect(buttonClick_vol);
    capacitorChargeUp = new Tone.Player('assets/audio/TVCapCharge.wav');
    capacitorChargeUp.connect(capacitorChargeUp_vol);
    fadeInStatic = () => setTimeout(() => {
        let currentLevel = bgVolume.get().volume;
        if (currentLevel < -24) {
            bgVolume.set({ volume: currentLevel + 2 });
            fadeInStatic();
        }
    }, 1);
    const clickStart = () => {
        Tone.start();
        buttonClick.start();
        backgroundNoise.start();
        capacitorChargeUp.start();
        staticPop.start('+0.25');
        staticPop.stop('+0.50');
        fadeInStatic();
        overlayEl.innerHTML = '';
        removeClick();
        let baseOpacity = 1;
        const fadeIn = () => setTimeout(() => {
            overlayEl.style.opacity = `${baseOpacity}`;
            if (baseOpacity > 0) {
                baseOpacity -= 0.06;
                fadeIn();
            }
            else {
                overlayEl.remove();
                mainUI.scene.run('MainInterface');
            }
        }, 12);
        fadeIn();
    };
    let removeClick = () => { overlayEl.removeEventListener('pointerup', clickStart); };
    document.addEventListener('pointerdown', () => Tone.start());
    overlayEl.addEventListener('pointerup', clickStart);
});
console.debug(window['chrome'].app, window['chrome'].app.getIsInstalled());
window['chrome'].app.installState((s) => { console.debug(s); });
//# sourceMappingURL=index.js.map