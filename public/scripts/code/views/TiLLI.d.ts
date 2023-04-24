import InputHandler from './screens/InputHandler';
import VisualDisplay from './screens/VisualDisplay';
import SubstrateGrid from './screens/SubstrateGrid';
export declare const UI_Layers: {};
export default class TiLLI extends Phaser.Scene {
    constructor();
    InputHandler: InputHandler;
    VisualDisplay: VisualDisplay;
    SubstrateGrid: SubstrateGrid;
    MODE: string;
    camera2: Phaser.Cameras.Scene2D.Camera;
    glyphcode: number;
    statusIndicator?: Phaser.GameObjects.Container;
    indicatorWindow?: Phaser.GameObjects.Arc;
    indicatorBorder?: Phaser.GameObjects.Arc;
    private status;
    init(): void;
    create(): void;
    private border;
    private borderPadding;
    update(): void;
}
export declare class DialogLine extends Phaser.GameObjects.Text {
    private printSpeed;
    setPrintSpeed(speed: number): this;
    private lineContent;
    constructor(s: Phaser.Scene, val?: string, colorConfig?: {
        fill?: string;
        stroke?: string;
    });
    print(onStart?: () => void, onEnd?: () => void, onChar?: (char: string) => void): void;
}
export declare class PortalNode extends Phaser.GameObjects.Container {
}
export declare class BranchNode extends Phaser.GameObjects.Container {
}
