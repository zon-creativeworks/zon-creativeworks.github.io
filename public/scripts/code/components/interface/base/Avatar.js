"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Avatar extends Phaser.GameObjects.Container {
    constructor(x, y, s) {
        super(s, x, y);
        this.extMaskGeometry = [];
        this.animationsList = [];
        this.addToUpdateList();
        this.addToDisplayList();
        this.draw = s.add;
        this.group = s.add.container;
        this.setAlpha(0);
        this.build();
    }
    build() { }
    play() { }
    stop() { }
    loop() { }
    anim() { }
    addAnimation(anim) { }
}
exports.default = Avatar;
//# sourceMappingURL=Avatar.js.map