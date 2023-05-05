import MixedMediaView from "./MixedMediaView";


// Constructor uses an MMV instead of PhaserScene so that both a Phaser scene and Three.js Scene are available to the Holoform
export default class Holoform extends Phaser.GameObjects.Container {
  public body: MatterJS.BodyType;
  public parent: MixedMediaView;

  constructor(dx: number, dy: number, mmv: MixedMediaView) {
    super(mmv, dx, dy);
    this.parent = mmv;
    this.addToUpdateList();
    this.addToDisplayList();
    this.build();
  }

  public build(): void {/* OVERRIDE ME */}
  public animate(): void {/* OVERRIDE ME */}
  private preUpdate(): void {this.animate()}
}