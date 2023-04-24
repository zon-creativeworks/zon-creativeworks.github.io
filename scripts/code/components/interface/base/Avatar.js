export default class Avatar extends Phaser.GameObjects.Container {
    constructor(x, y, s) {
        super(s, x, y);
        this.addToUpdateList();
        this.addToDisplayList();
        this.draw = s.add;
        this.group = s.add.container;
        this.setAlpha(0);
        this.build();
    }
    build() { }
    group;
    draw;
    extMaskGeometry = [];
    play() { }
    stop() { }
    loop() { }
    anim() { }
    animations;
    animationsList = [];
    addAnimation(anim) { }
}
//# sourceMappingURL=Avatar.js.map