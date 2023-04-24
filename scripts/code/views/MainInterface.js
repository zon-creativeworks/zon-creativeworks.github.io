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
Object.defineProperty(exports, "__esModule", { value: true });
const Tone = __importStar(require("tone"));
const THREE = __importStar(require("three"));
const EffectComposer_1 = require("three/examples/jsm/postprocessing/EffectComposer");
const index_1 = require("../index");
const TexturePass_1 = require("three/examples/jsm/postprocessing/TexturePass");
const TAARenderPass_1 = require("three/examples/jsm/postprocessing/TAARenderPass");
const PostProcessing_1 = require("../components/manager/PostProcessing");
class MainInterface extends Phaser.Scene {
    constructor() {
        super('MainInterface');
        this.rootScene = new THREE.Scene();
        this.onlineTD = new Date();
        this.played01H = false;
        this.played10M = false;
        this.nearField = 0.1e-3;
        this.distField = 10.0e3;
        this.fieldOfView = 60;
        this.isQuietTime = false;
        this.cursor = { x: 0, y: 0 };
        index_1.phaseCanvas.width = window.innerWidth;
        index_1.phaseCanvas.height = window.innerHeight;
        index_1.threeCanvas.width = window.innerWidth;
        index_1.threeCanvas.height = window.innerHeight;
        this.res = {
            w: window.innerWidth,
            h: window.innerHeight,
        };
        this.aspectRatio = this.res.w / this.res.h;
        this.rootRenderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas: index_1.threeCanvas,
        });
        this.rootRenderer.setSize(this.res.w, this.res.h);
        this.rootRenderer.setPixelRatio(window.devicePixelRatio);
        this.phaseTexture = new THREE.CanvasTexture(index_1.phaseCanvas);
    }
    getCursor() { return this.cursor; }
    ;
    handleInteraction(area, handlers) {
        const isHover = area.contains(this.cursor.x, this.cursor.y);
        const isClick = isHover && this.input.activePointer.isDown;
        const isTouch = this.input.mousePointer.wasTouch;
        if (isHover && handlers.onHover)
            handlers.onHover(this.getCursor());
        else if ((isClick || isTouch) && handlers.onClick)
            handlers.onClick(this.getCursor());
        else if (isTouch && handlers.onTouch)
            handlers.onTouch(this.getCursor());
    }
    preload() {
        this.load.svg('TiLLI', 'assets/icons/TiLLI.svg', { scale: 0.55 });
        this.load.svg('Tapehead-Base', 'assets/icons/TapeHead_NoSpoke.svg', { scale: 0.55 });
        this.load.svg('Tapehead-SpokeEye', 'assets/icons/TapeHead_SpokeOnly.svg', { scale: 0.55 });
        this.load.svg('eben', 'assets/icons/modes/eben.svg', { scale: 0.12 });
        this.load.svg('wandry', 'assets/icons/modes/wandry.svg', { scale: 0.2 });
        this.load.svg('tapehead', 'assets/icons/modes/tapehead.svg', { scale: 0.12 });
        this.load.svg('tillibot', 'assets/icons/modes/tillibot.svg', { scale: 0.12 });
        this.load.svg('robohobb', 'assets/icons/modes/robohobb.svg', { scale: 0.12 });
        this.load.svg('gyro', 'assets/icons/sensors/gyro.svg', { scale: 0.16 });
        this.load.svg('settings', 'assets/icons/settings.svg', { scale: 0.06 });
        this.load.svg('transcript', 'assets/icons/transcript.svg', { scale: 0.06 });
    }
    init() {
        this.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF, alpha: 0.32 } })
            .strokeRect(-this.res.w / 2, -this.res.h / 2, window.innerWidth, window.innerHeight);
        this.events.on('preupdate', () => this.cursor = { x: this.input.activePointer.worldX, y: this.input.activePointer.worldY });
        this.camera3D = new THREE.OrthographicCamera(-this.res.w / 2, +this.res.w / 2, -this.res.h / 2, +this.res.h / 2, 0.001, 10000);
        const pxInset = 26;
        const maxCornerTL = new Phaser.Math.Vector2(-(this.res.w / 2) + pxInset, -(this.res.h / 2) + pxInset);
        const maxCornerTR = new Phaser.Math.Vector2(+(this.res.w / 2) - pxInset, -(this.res.h / 2) + pxInset);
        const maxCornerBL = new Phaser.Math.Vector2(-(this.res.w / 2) + pxInset, +(this.res.h / 2) - pxInset);
        const maxCornerBR = new Phaser.Math.Vector2(+(this.res.w / 2) - pxInset, +(this.res.h / 2) - pxInset);
        const open = new Tone.Player('assets/audio/terminalOpen.wav').toDestination();
        const shut = new Tone.Player('assets/audio/terminalClose.wav').toDestination();
        this.camera2D = this.cameras.main;
        this.camera2D.centerOn(0, 0);
    }
    create() {
        const mainVolume = new Tone.Volume(-9).toDestination();
        const aye = new Tone.Player('assets/audio/aye.wav').connect(mainVolume);
        const nay = new Tone.Player('assets/audio/nay.wav').toDestination();
        const activate = new Tone.Player('assets/audio/activate.wav').connect(mainVolume);
        const deactivate = new Tone.Player('assets/audio/deactivate.wav').toDestination();
        const staticPulse = new Tone.Player('assets/audio/static_pulse.wav').toDestination();
        const notificationPing = new Tone.Player('assets/audio/notificationPing.wav').toDestination();
        const menuOpen = new Tone.Player('assets/audio/openMenu.wav').toDestination();
        const menuClose = new Tone.Player('assets/audio/closeMenu.wav').toDestination();
        const menuSelect = new Tone.Player('assets/audio/menuSelect.wav').toDestination();
        const subVol = new Tone.Volume(-12).toDestination();
        const FX = [
            new Tone.Player('assets/audio/ScreenHum.wav').toDestination(),
            new Tone.Player('assets/audio/EMF_Noise.wav').toDestination(),
            new Tone.Player('assets/audio/scannerFX.wav').connect(subVol),
            new Tone.Player('assets/audio/BrokenSig.wav').connect(subVol),
        ];
        const playFX = () => setTimeout(() => {
            const fxPlayer = Phaser.Utils.Array.GetRandom(FX);
            if (fxPlayer.state === 'stopped')
                fxPlayer.start();
            !this.isQuietTime && playFX();
        }, Phaser.Math.Between(30000, 120000));
        playFX();
        const bellVolume = new Tone.Volume(-3).toDestination();
        this.bell01H = new Tone.Player('assets/audio/Bell01H.wav').connect(bellVolume);
        this.bell10M = new Tone.Player('assets/audio/Bell10M.wav').connect(bellVolume);
        let pastHour = null;
        Tone.Offline(() => {
            setInterval(() => {
                this.onlineTD.setTime(Date.now());
                !pastHour && (pastHour = this.onlineTD.getHours());
                this.isQuietTime = this.onlineTD.getHours() >= 23 || this.onlineTD.getHours() <= 7;
                if (!this.isQuietTime) {
                    if (this.onlineTD.getMinutes() % 10 === 0) {
                        if (this.onlineTD.getHours() !== pastHour) {
                            !this.played01H && this.bell01H.start();
                            this.played01H = true;
                        }
                        else {
                            !this.played10M && this.bell10M.start();
                            this.played10M = true;
                            this.played01H = false;
                        }
                    }
                    else {
                        this.played10M = false;
                    }
                }
            }, 1000);
        }, 0.1, 2);
        this.isMobile = (window.screen.orientation.type === 'portrait-primary' && window.screen.orientation.angle === 0
            ||
                window.screen.orientation.type === 'landscape-primary' && window.screen.orientation.angle === 90);
        let gyroscope;
        let accelerometer;
        let gravitySensor;
        if ('Accelerometer' in window) {
            accelerometer = new window['Accelerometer']();
        }
        if ('Gyroscope' in window) {
            gyroscope = new Gyroscope({ frequency: 60 });
        }
        if ('GravitySensor' in window) {
            gravitySensor = new window['GravitySensor'];
        }
        let debugOutput = ``;
        const Debugger = this.add.text(-(this.res.w / 2) + 36, -(this.res.h / 2) + 36, debugOutput, {
            fontSize: '12px',
            color: '#FFFFFF'
        });
        let deviceMotionX = -Infinity;
        let deviceMotionY = -Infinity;
        let deviceMotionZ = -Infinity;
        let deviceRotationAlpha = -Infinity;
        let deviceRotationBeta = -Infinity;
        let deviceRotationGamma = -Infinity;
        let deviceOrientationAlpha = -Infinity;
        let deviceOrientationBeta = -Infinity;
        let deviceOrientationGamma = -Infinity;
        window.addEventListener('devicemotion', (dme) => {
            var _a, _b, _c, _d, _e, _f;
            deviceMotionX = (_a = dme.acceleration) === null || _a === void 0 ? void 0 : _a.x;
            deviceMotionY = (_b = dme.acceleration) === null || _b === void 0 ? void 0 : _b.y;
            deviceMotionZ = (_c = dme.acceleration) === null || _c === void 0 ? void 0 : _c.z;
            deviceRotationAlpha = (_d = dme.rotationRate) === null || _d === void 0 ? void 0 : _d.alpha;
            deviceRotationBeta = (_e = dme.rotationRate) === null || _e === void 0 ? void 0 : _e.beta;
            deviceRotationGamma = (_f = dme.rotationRate) === null || _f === void 0 ? void 0 : _f.gamma;
        });
        window.addEventListener('deviceorientation', (doe) => {
            deviceOrientationAlpha = doe.alpha;
            deviceOrientationBeta = doe.beta;
            deviceOrientationGamma = doe.gamma;
        });
        let touchStart = false;
        let touchEnd = false;
        let touchCancel = false;
        let dragStart = false;
        let isDragging = false;
        let dragEnd = false;
        let doubleClick = false;
        window.addEventListener('dblclick', () => {
            doubleClick = true;
            setTimeout(() => doubleClick = false, 1000);
        });
        window.ontouchstart = () => {
            touchStart = true;
            touchEnd = false;
        };
        window.ontouchend = () => {
            touchEnd = true;
            touchStart = false;
        };
        window.ontouchmove = (m) => {
            console.debug(m);
        };
        const comp = new EffectComposer_1.EffectComposer(this.rootRenderer);
        const vec2res = new THREE.Vector2(this.res.h, this.res.w);
        const rootPass = new TAARenderPass_1.TAARenderPass(this.rootScene, this.camera3D, 0xAF77AF, 0.54);
        const tx2DPass = new TexturePass_1.TexturePass(this.phaseTexture, 0.9);
        const hazyGlow = new PostProcessing_1.UnrealBloomPass(vec2res, 0.63, 0.003, 0.001);
        const retroCRT = new PostProcessing_1.FilmPass(0.35, 0.64, window.screen.height * 2, 0);
        const timeHaze = new PostProcessing_1.AfterimagePass(0.3);
        const normalize = new PostProcessing_1.AdaptiveToneMappingPass(true, 64);
        const transGlitch = new PostProcessing_1.GlitchPass(-1);
        transGlitch.randX = 0.001;
        transGlitch.curF = 0.00001;
        transGlitch.enabled = false;
        comp.addPass(rootPass);
        comp.addPass(tx2DPass);
        comp.addPass(transGlitch);
        comp.addPass(timeHaze);
        comp.addPass(hazyGlow);
        comp.addPass(normalize);
        comp.addPass(retroCRT);
        comp.addPass(PostProcessing_1.FXAA);
        setInterval(() => {
            retroCRT.uniforms['time'] = new THREE.Uniform(0);
        }, 3000);
        this.events.on('update', () => { comp.render(); });
    }
    update() {
        this.phaseTexture.needsUpdate = true;
        this.camera3D.updateProjectionMatrix();
        this.camera3D.updateWorldMatrix(true, true);
    }
}
exports.default = MainInterface;
//# sourceMappingURL=MainInterface.js.map