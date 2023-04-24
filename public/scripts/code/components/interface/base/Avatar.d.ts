export default class Avatar extends Phaser.GameObjects.Container {
    constructor(x: number, y: number, s: Phaser.Scene);
    build(): void;
    group: any;
    draw: Phaser.GameObjects.GameObjectFactory;
    extMaskGeometry: Phaser.Geom.Circle[];
    play(): void;
    stop(): void;
    loop(): void;
    anim(): void;
    private animations;
    private animationsList;
    private addAnimation;
}
