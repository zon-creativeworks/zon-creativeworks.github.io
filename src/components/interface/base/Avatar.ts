export default class Avatar extends Phaser.GameObjects.Container {
  constructor(x: number, y: number, s: Phaser.Scene) {

    // Initialize
    super(s, x, y);
    this.addToUpdateList();
    this.addToDisplayList();

    // Assign Shorthands
    this.draw = s.add;
    this.group = s.add.container;

    // Make this initially invisible
    this.setAlpha(0);

    // Build the Avatar
    this.build();
  }

  public build(): void {/* override me */}

  // Shorthand bindings
  public group: any;
  public draw: Phaser.GameObjects.GameObjectFactory;

  // Geometry Mask 
  public extMaskGeometry: Phaser.Geom.Circle[] = [];

  // Animation Controls
  public play(): void {}
  public stop(): void {}
  public loop(): void {}
  public anim(): void {}

  // Animation managers
  private animations: {[key: string]: Phaser.Tweens.Tween};
  private animationsList: {name: string, description: string}[] = [];
  private addAnimation(anim: Phaser.Types.Tweens.TweenBuilderConfig): void {}
}