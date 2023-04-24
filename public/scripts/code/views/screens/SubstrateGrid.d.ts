export default class SubstrateGrid extends Phaser.Scene {
    constructor();
    private caret;
    private isTyping;
    private transcript;
    init(): void;
    create(): void;
    update(): void;
    private dialogQueue;
    addDialog(dialog?: string): void;
}
