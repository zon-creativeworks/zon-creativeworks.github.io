import Avatar from "../interface/base/Avatar";
export default class Tapehead_Avatar extends Avatar {

  private eye: Phaser.GameObjects.Image;
  override build(): void {

    // Avatar Base
    const base = this.scene.add.image(+3, 0, 'Tapehead-Base');

    // Spoke Eye
    this.eye = this.scene.add.image(-66, -13, 'Tapehead-SpokeEye').setAlpha(0.64);

    // Spectrum Analyzer

    this.add([this.eye, base]);
  }
  preUpdate(): void {
    this.eye.angle += 3;
  }
}