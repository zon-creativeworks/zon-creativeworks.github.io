export const UI_Layers = {};
export default class TiLLI extends Phaser.Scene {
    constructor() { super('TiLLI'); }
    InputHandler;
    MODE = 'CONSOLE';
    camera2;
    glyphcode = 0x00;
    statusIndicator;
    indicatorWindow;
    indicatorBorder;
    status;
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
    border;
    borderPadding = 24;
    update() {
        this.MODE === 'MAIN' && this.statusIndicator?.setPosition(0, 0);
    }
    ;
}
export class DialogLine extends Phaser.GameObjects.Text {
    printSpeed = 60;
    setPrintSpeed(speed) { this.printSpeed = speed; return this; }
    ;
    lineContent = '';
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
        val && (this.lineContent = val);
        s.add.existing(this);
    }
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
export class PortalNode extends Phaser.GameObjects.Container {
}
export class BranchNode extends Phaser.GameObjects.Container {
}
//# sourceMappingURL=TiLLI.js.map