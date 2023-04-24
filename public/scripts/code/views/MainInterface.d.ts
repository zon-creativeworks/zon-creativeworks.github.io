export default class MainInterface extends Phaser.Scene {
    private camera3D;
    private rootScene;
    private rootRenderer;
    private phaseTexture;
    private onlineTD;
    private bell10M;
    private bell01H;
    private played01H;
    private played10M;
    private camera2D;
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
    create(): void;
    update(): void;
}
