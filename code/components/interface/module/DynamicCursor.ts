export default class DynamicCursor extends Phaser.GameObjects.Container {
  constructor(x: number, y: number, s: Phaser.Scene) {
    super(s, x, y);

    this.addToDisplayList();
    this.setup();
    s.events.on('update', () => this.animate());
  }

  setup(): void {}
  animate(): void {}
}