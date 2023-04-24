"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TiLLI_1 = require("../TiLLI");
class SubstrateGrid extends Phaser.Scene {
    constructor() {
        super('SubstrateGrid');
        this.isTyping = false;
        this.dialogQueue = [];
    }
    init() {
        this.cameras.main.centerOn(0, 0);
        this.transcript = new Transcript();
    }
    ;
    create() {
        const consolePadding = 32;
        const consoleZone = this.add.zone(consolePadding / 2, consolePadding / 2, window.innerWidth - consolePadding, window.innerHeight - consolePadding);
        TiLLI_1.UI_Layers['console'] = consoleZone;
        let visible = false;
        let blinkRate = 300;
        const state = {
            on: '█',
            off: ' '
        };
        this.caret = this.add.text(0, 0, state.on, {});
        Phaser.Display.Align.In.TopLeft(this.caret, consoleZone);
        setInterval(() => { visible = !visible; }, blinkRate);
        this.events.on('preupdate', () => this.caret.setText(this.isTyping ? state.on : `${visible ? state.on : state.off}`));
        this.game.events.on('dnclick', () => {
            this.scene.get('AiDA').glyphcode === 0x00 && this.game.events.emit('status', 0x02);
        });
        this.game.events.on('upclick', () => {
            this.game.events.emit('status', 0x00);
        });
        this.addDialog('Don\'t forget to add diarization via whisper.');
    }
    update() {
        const AiDA = this.scene.get('AiDA');
        this.caret.alpha = AiDA.MODE === 'CONSOLE' ? 1 : 0;
        this.transcript.baseArray.forEach((dialogLine) => {
            dialogLine.alpha = AiDA.MODE === 'CONSOLE' ? 1 : 0;
        });
        AiDA.MODE = 'MAIN';
    }
    ;
    addDialog(dialog) {
        dialog = !dialog ? '\n' : dialog;
        let initialPosition = {
            x: this.caret.x,
            y: this.caret.y
        };
        const style = {
            fill: `rgba(255, 255, 255, 0.3)`,
            stroke: `rgba(255, 200, 0, 1.0)`,
        };
        let newLine;
        if (dialog !== '\n' && dialog.includes('\n')) {
            dialog.split('\n').forEach(line => {
                newLine = new TiLLI_1.DialogLine(this, line, style);
                newLine.x = initialPosition.x;
                newLine.y = initialPosition.y;
                if (!this.isTyping) {
                    this.transcript.push(newLine, {
                        onStart: () => {
                            this.isTyping = true;
                            if (this.isTyping || this.dialogQueue.length > 0)
                                this.game.events.emit('status', 0x01);
                            else
                                this.game.events.emit('status', 0x00);
                        },
                        onEnd: () => {
                            this.isTyping = false;
                            this.caret.x = initialPosition.x;
                            this.caret.y = initialPosition.y + newLine.height;
                            const queuedLine = this.dialogQueue.shift();
                            queuedLine && this.addDialog(queuedLine);
                            if (this.isTyping || this.dialogQueue.length > 0)
                                this.game.events.emit('status', 0x01);
                            else
                                this.game.events.emit('status', 0x00);
                        },
                        onChar: (char) => {
                            this.caret.x = initialPosition.x + newLine.width;
                        }
                    });
                }
                else {
                    this.dialogQueue.push(line);
                }
            });
        }
        else {
            newLine = new TiLLI_1.DialogLine(this, dialog, style);
            newLine.x = initialPosition.x;
            newLine.y = initialPosition.y;
            if (!this.isTyping) {
                this.transcript.push(newLine, {
                    onStart: () => {
                        this.isTyping = true;
                        if (this.isTyping || this.dialogQueue.length > 0)
                            this.game.events.emit('status', 0x01);
                        else
                            this.game.events.emit('status', 0x00);
                    },
                    onEnd: () => {
                        this.isTyping = false;
                        this.caret.x = initialPosition.x;
                        this.caret.y = initialPosition.y + newLine.height;
                        const queuedLine = this.dialogQueue.shift();
                        queuedLine && this.addDialog(queuedLine);
                        if (this.isTyping || this.dialogQueue.length > 0)
                            this.game.events.emit('status', 0x01);
                        else
                            this.game.events.emit('status', 0x00);
                    },
                    onChar: (char) => {
                        this.caret.x = initialPosition.x + newLine.width;
                    }
                });
            }
            else {
                this.dialogQueue.push(dialog);
            }
        }
    }
}
exports.default = SubstrateGrid;
class Transcript extends Array {
    constructor() {
        super(...arguments);
        this.baseArray = [];
    }
    push(line, config) {
        this.baseArray.push(line);
        line.print(config === null || config === void 0 ? void 0 : config.onStart, config === null || config === void 0 ? void 0 : config.onEnd, config === null || config === void 0 ? void 0 : config.onChar);
        this.length = this.baseArray.length;
        return this.length;
    }
}
class Speaker {
}
;
//# sourceMappingURL=SubstrateGrid.js.map