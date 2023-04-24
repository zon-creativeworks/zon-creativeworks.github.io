import * as THREE from 'three';
import Avatar from './base/Avatar';
export default class MainInterface extends Phaser.Scene {
    invokerDisc: Phaser.GameObjects.Container;
    invokerRoot: {
        x: number;
        y: number;
    };
    interactron: Phaser.GameObjects.Container;
    private camera3D;
    private rootScene;
    private rootRenderer;
    private phaseTexture;
    obj2D: Phaser.GameObjects.GameObject[];
    obj3D: THREE.Mesh[];
    private independentOrbitals;
    private camera2D;
    menuSlotNodes: Phaser.GameObjects.Container;
    modeName: string;
    activeAvatar: Avatar;
    contextDock: Phaser.GameObjects.Arc;
    textInterfaceToggle: Phaser.GameObjects.Container;
    private programLabel;
    menuActive: boolean;
    IRISActive: boolean;
    termActive: boolean;
    private mandorlaMode;
    private stateIndicator;
    private onDoubleTap;
    res: {
        w: number;
        h: number;
    };
    isMobile: boolean;
    nearField: number;
    distField: number;
    aspectRatio: number;
    fieldOfView: number;
    isQuietTime: boolean;
    cursor: {
        x: number;
        y: number;
    };
    getCursor(): {
        x: number;
        y: number;
    };
    handleInteraction(area: Phaser.Geom.Circle, handlers: {
        onHover?: (cPos: {
            x: number;
            y: number;
        }) => void;
        onClick?: (cPos: {
            x: number;
            y: number;
        }) => void;
        onTouch?: (cPos: {
            x: number;
            y: number;
        }) => void;
    }): void;
    constructor();
    preload(): void;
    init(): void;
    private outlineHeight;
    create(): void;
    finalize(): void;
    private onlineTD;
    private bell10M;
    private bell01H;
    played01H: boolean;
    played10M: boolean;
    update(): void;
    resetDraw(resizeEvent?: Event): void;
}
