"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const __1 = require("../..");
const EffectComposer_1 = require("three/examples/jsm/postprocessing/EffectComposer");
const RenderPass_1 = require("three/examples/jsm/postprocessing/RenderPass");
const UnrealBloomPass_1 = require("three/examples/jsm/postprocessing/UnrealBloomPass");
const AfterimagePass_1 = require("three/examples/jsm/postprocessing/AfterimagePass");
const FilmPass_1 = require("three/examples/jsm/postprocessing/FilmPass");
const ShaderPass_1 = require("three/examples/jsm/postprocessing/ShaderPass");
const FXAAShader_1 = require("three/examples/jsm/shaders/FXAAShader");
class VisualDisplay extends Phaser.Scene {
    constructor() { super('VisualDisplay'); }
    init() {
        this.cameras.main.centerOn(0, 0);
        if (document.fullscreenEnabled && document.fullscreenElement === null) {
            this.aspectRatio = window.innerWidth / window.innerHeight;
            this.camera3 = new THREE.OrthographicCamera(-window['cx'], window['cx'], -window['cy'], window['cy'], -100, 100);
            this.scene.get('AiDA')['camera3'] = this.camera3;
            this.scene3 = new THREE.Scene();
            this.renderer3 = new THREE.WebGLRenderer({ canvas: __1.threeCanvas });
            this.renderer3.setSize(window.innerWidth, window.innerHeight);
            this.renderer3.setClearAlpha(0);
            let quad = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 1, 1);
            this.phaser = new THREE.CanvasTexture(__1.phaseCanvas);
            this.phaser.needsUpdate = true;
            const flatMat = new THREE.MeshBasicMaterial({
                map: this.phaser,
                transparent: true,
            });
            this.quadMesh = new THREE.Mesh(quad, flatMat);
            const cursor3_geom = new THREE.IcosahedronGeometry(36, 1);
            const defaultMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x00ACFF,
                transparent: true,
                opacity: 0.09,
                emissive: 0xFFFFFF,
                emissiveIntensity: 1,
                transmission: 0x000000,
            });
            defaultMaterial.wireframe = true;
            this.cursor3 = new THREE.Mesh(cursor3_geom, defaultMaterial);
            this.quadMesh.rotation.x = Phaser.Math.DegToRad(180);
            this.scene3.add(new THREE.AmbientLight(0xFFFFFF, 1), this.quadMesh);
            const renderPass = new RenderPass_1.RenderPass(this.scene3, this.camera3);
            const ueBloomPass = new UnrealBloomPass_1.UnrealBloomPass(new THREE.Vector2(), 0.42, 0.03, 0);
            const afterImage = new AfterimagePass_1.AfterimagePass(0.3);
            const vhs = new FilmPass_1.FilmPass(1, 0.6, 4096, 0);
            const fxaa = new ShaderPass_1.ShaderPass(FXAAShader_1.FXAAShader);
            this.effectComposer = new EffectComposer_1.EffectComposer(this.renderer3);
            this.effectComposer.setPixelRatio(window.devicePixelRatio);
            this.effectComposer.addPass(renderPass);
            this.effectComposer.addPass(afterImage);
            this.effectComposer.addPass(ueBloomPass);
            this.effectComposer.addPass(vhs);
            this.effectComposer.addPass(fxaa);
        }
    }
    create() {
        var _a;
        const AiDA = this.scene.get('AiDA');
        const dotRingRadius = (((_a = this.scene.get('AiDA').indicatorBorder) === null || _a === void 0 ? void 0 : _a.radius) * 1.3) || 0;
        this.graphics2 = (this.add.graphics()
            .fillStyle(0x000000, 1)
            .lineStyle(0.6, 0xFFFFFF, 1)
            .strokeCircle(0, 0, dotRingRadius));
        const dotRing = new Phaser.Geom.Circle(0, 0, dotRingRadius);
        dotRing.getPoints(3).forEach(dot => {
            this.graphics2
                .fillCircle(dot.x, dot.y, 6)
                .strokeCircle(dot.x, dot.y, 6);
        });
        const nameDisplay = this.add.container(0, 0);
        const sensors = this.add.graphics();
        sensors.x -= 115;
        sensors.lineStyle(3, 0xACACAC, 0.3);
        sensors.strokeRoundedRect(0, 0, 21 + 34 + 34 + 34 + 34 + 21, 42, 18);
        sensors.fillStyle(0xFF0000, 0.06);
        sensors.lineStyle(3, 0xACACAC, 0.4);
        sensors.fillCircle(21, 21, 15);
        sensors.strokeCircle(21, 21, 15);
        sensors.fillCircle(21 + 34, 21, 15);
        sensors.strokeCircle(21 + 34, 21, 15);
        sensors.strokeCircle(21 + 34 + 34, 21, 15);
        sensors.strokeCircle(21 + 34 + 34 + 34, 21, 15);
        sensors.strokeCircle(21 + 34 + 34 + 34 + 34, 21, 15);
        this.add.text((window['cx']) - 220, -(window['cy']) + 34 + 6, '🎤 🧭  🧠 🔊 📳', {
            fontSize: '13pt',
            fontFamily: 'monospace',
            color: 'rgba(100, 100, 100, 0.3)',
            padding: {
                top: 3
            }
        });
        nameDisplay.add([
            sensors
        ]);
        AiDA.statusIndicator && nameDisplay.setPosition(+(window['cx'] - (144 * 0.78)), -(window['cy'] - 30));
        const isMain = AiDA.MODE === 'MAIN';
        const mainPortalNode = this.add.container(0, 0);
        const shadowViewer = this.add.circle(0, 0, ((window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) * 0.22) / 2).setStrokeStyle(6, 0xFFFFFF, 1);
        const innerOrbital = this.add.circle(0, 0, ((window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) * 0.70) / 2, 0xFFFFFF, 0).setStrokeStyle(3, 0xFFAC00, 1);
        const outerOrbital = this.add.circle(0, 0, ((window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) * 0.75) / 2).setStrokeStyle(3, 0xFFAC00, 1);
        const line = this.add.line(0, 0, -30, 0, 30, 0, 0xFFFFFF, 1).setAngle(-90);
        const blackmask = this.add.circle(0, 30, 18, 0x000000, 1);
        this.add.circle(0, -window['cy'] + 32, 9).setStrokeStyle(2, 0xFFFFFF, 1);
        this.add.circle(-window['cx'] + 32, 0, 3, 0xFFFFFF, 1);
        this.add.circle(-window['cx'] + 32, 0, 9).setStrokeStyle(2, 0xFFFFFF, 1);
        this.add.circle(+window['cx'] - 32, 0, 3, 0xFFFFFF, 1);
        this.add.circle(+window['cx'] - 32, 0, 9).setStrokeStyle(2, 0xFFFFFF, 1);
        line.x = -window['cx'] + 32;
        line.y = 0 - 30;
        blackmask.setPosition(-window['cx'] + 32, 0);
        this.add.circle(0, +window['cy'] - 32, 3, 0xFFFFFF, 1);
        this.add.circle(0, +window['cy'] - 32, 9).setStrokeStyle(2, 0xFFFFFF, 1);
        const originalWidth = window.innerWidth;
        document.onfullscreenchange = () => {
            if (document.fullscreenElement) {
                const aspect = window.screen.width / window.screen.height;
                this.game.scale.resize(window.screen.width, window.screen.height);
                this.renderer3.setSize(window.screen.width, window.screen.height);
                this.effectComposer.setSize(window.screen.width, window.screen.height);
                this.camera3.left = -(window.screen.width / 2) * aspect;
                this.camera3.right = (window.screen.height / 2) * aspect;
                this.camera3.updateProjectionMatrix();
            }
        };
    }
    update() {
        const AiDA = this.scene.get('AiDA');
        if (AiDA.statusIndicator) {
            this.cursor3.position.x = AiDA.statusIndicator.x;
            this.cursor3.position.y = AiDA.statusIndicator.y;
        }
        this.graphics2.setPosition(this.cursor3.position.x, this.cursor3.position.y);
        this.cursor3.rotation.y += 0.03;
        this.cursor3.rotation.x = Phaser.Math.DegToRad(45);
        this.graphics2.angle--;
        this.graphics2.setDepth(99);
        AiDA.MODE === 'MAIN' && (this.graphics2.scale = 2.45);
        this.cursor3.visible = AiDA.glyphcode === 0x00;
        this.phaser.needsUpdate = true;
        this.effectComposer.render();
    }
}
exports.default = VisualDisplay;
//# sourceMappingURL=VisualDisplay.js.map