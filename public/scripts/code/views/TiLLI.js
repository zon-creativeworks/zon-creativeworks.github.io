"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchNode = exports.PortalNode = exports.DialogLine = exports.UI_Layers = void 0;
exports.UI_Layers = {};
class TiLLI extends Phaser.Scene {
    constructor() {
        super('TiLLI');
        this.MODE = 'CONSOLE';
        this.glyphcode = 0x00;
        this.borderPadding = 24;
    }
    init() {
        this.camera2 = this.cameras.main;
        this.camera2.centerOn(0, 0);
        this.camera2.transparent = true;
    }
    create() {
        console.debug('TiLLI: Online 🌐');
        this.border = this.add.graphics();
        this.scene.launch('ThreeOrchestrator');
    }
    update() {
        var _a;
        this.MODE === 'MAIN' && ((_a = this.statusIndicator) === null || _a === void 0 ? void 0 : _a.setPosition(0, 0));
    }
    ;
}
exports.default = TiLLI;
class DialogLine extends Phaser.GameObjects.Text {
    constructor(s, val, colorConfig) {
        super(s, 0, 0, '', {
            align: 'left',
            fontSize: '12pt',
            color: 'rgba(256, 200, 0, 1.0)',
            stroke: 'rgba(255, 255, 255, 0.03)',
            strokeThickness: 6,
            wordWrap: { width: window.innerWidth - 120 },
            padding: {
                top: 3,
                left: 6,
                right: 6,
                bottom: 3,
            }
        });
        this.printSpeed = 60;
        this.lineContent = '';
        val && (this.lineContent = val);
        s.add.existing(this);
    }
    setPrintSpeed(speed) { this.printSpeed = speed; return this; }
    ;
    print(onStart, onEnd, onChar) {
        onStart && onStart();
        this.lineContent.split('').forEach((char, charNum) => {
            setTimeout(() => {
                this.text += char;
                onChar && onChar(char);
                if (charNum === this.lineContent.length - 1 && onEnd)
                    onEnd();
            }, this.printSpeed * charNum);
        });
    }
}
exports.DialogLine = DialogLine;
class PortalNode extends Phaser.GameObjects.Container {
}
exports.PortalNode = PortalNode;
class BranchNode extends Phaser.GameObjects.Container {
}
exports.BranchNode = BranchNode;
//# sourceMappingURL=TiLLI.js.map