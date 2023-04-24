import Avatar from '../interface/base/Avatar';
export default class TilliBot_Avatar extends Avatar {
  override build(): void {
    const eyeSize = 72;
    const eyeSpacing = 64;

    // Base
    const Base = this.scene.add.image(0, 0, 'TiLLI');

    // Eyes
    const Eyes_L = this.draw.circle(-eyeSpacing, 0, eyeSize / 2, 0xFFFFFF, 0.64).setStrokeStyle(6, 0xAC00FF, 1.00);
    const Eyes_R = this.draw.circle(+eyeSpacing, 0, eyeSize / 2, 0xFFFFFF, 0.64).setStrokeStyle(6, 0xAC00FF, 1.00);
    const Eyes = this.group(0, -6, [Eyes_L, Eyes_R]);

    const blink = () => setTimeout(() => {
        Eyes_L.scaleY = 0.12;
        Eyes_R.scaleY = 0.12;
        setTimeout(() => {
          Eyes_L.scaleY = 1;
          Eyes_R.scaleY = 1;
      blink();
        }, 120);
    }, Phaser.Math.Between(1200, 12_000));
    blink();

    this.add([Base, Eyes]).setAlpha(0);
  }
}