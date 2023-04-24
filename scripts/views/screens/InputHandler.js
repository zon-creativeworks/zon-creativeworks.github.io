"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const phaser_1 = require("phaser");
class InputHandler extends phaser_1.default.Scene {
    constructor() { super('InputHandler'); }
    init() {
        this.cameras.main.centerOn(0, 0);
    }
    preload() {
        this.load.audio('affirm', '/assets/audio/affirm.wav');
    }
    create() {
        this.matter.add.pointerConstraint();
        this.game.cache.physics.add('matter', this.matter);
        const affirmationTone = this.sound.add('affirm');
        this.input.addListener('wheel', (wheel) => {
            const zoomDelta = wheel.deltaY;
            zoomDelta < 0 && this.game.events.emit('zoom-in');
            zoomDelta > 0 && this.game.events.emit('zoom-out');
        });
        const upClick = (at) => { this.game.events.emit('upclick', at); };
        const dnClick = (at) => { this.game.events.emit('dnclick', at); };
        const AiDA = this.scene.get('AiDA');
        this.input.addListener('pointerup', (pointer) => {
            console.debug('Mouse Down Released');
            upClick({ x: pointer.worldX, y: pointer.worldY });
        });
        this.input.addListener('pointerdown', (pointer) => {
            console.debug('Mouse Down Captured');
            affirmationTone.play();
            dnClick({ x: pointer.worldX, y: pointer.worldY });
        });
        this.input.addListener('touchstart', (tStart) => {
            dnClick({ x: tStart.worldX, y: tStart.worldY });
        });
        this.input.addListener('touchmove', (tDrag) => {
            console.debug(`Touch Drag:`, tDrag);
        });
        this.input.addListener('touchend', (tEnd) => {
            upClick({ x: tEnd.worldX, y: tEnd.worldY });
        });
        let keyStatus;
        this.input.keyboard.on('keydown', (down) => {
            clearTimeout(keyStatus);
            keyStatus = setTimeout(() => {
                this.game.events.emit('status', '');
            }, 800);
            this.game.events.emit('status', 'Typing');
            console.debug(`Key Pressed: `, down.key);
            if (down.key === 'Tab') {
                console.debug('Keypad active');
            }
        });
    }
}
exports.default = InputHandler;
//# sourceMappingURL=InputHandler.js.map