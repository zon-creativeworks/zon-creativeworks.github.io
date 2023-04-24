export default class SensorComponent extends Phaser.GameObjects.Container {
  constructor(s: Phaser.Scene, x: number, y: number) {
    super(s, x, y);
    this.addToUpdateList();
  }

  private async preUpdate() {

  }
}