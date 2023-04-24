"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bezel = exports.phaseCanvas = exports.threeCanvas = void 0;
const phaser_1 = __importDefault(require("phaser"));
const Tone = __importStar(require("tone"));
const TiLLI_1 = __importDefault(require("./views/TiLLI"));
const InputHandler_1 = __importDefault(require("./components/manager/InputHandler"));
const MainInterface_1 = __importDefault(require("./views/MainInterface"));
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