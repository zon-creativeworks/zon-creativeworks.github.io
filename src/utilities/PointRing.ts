export default class PointRing extends Phaser.GameObjects.Arc {

  override geom: Phaser.Geom.Circle;
  private targetRadius: number | undefined;
  private pointRefs: Phaser.Geom.Point[] = [];

  constructor(s: Phaser.Scene, x: number, y: number, r: number) {
    super(s, x, y, r);

    this.geom = new Phaser.Geom.Circle(this.x, this.y, this.radius);

    this.setFillStyle(0x000000, 0);
    this.setStrokeStyle(3, 0xFF00FF, 1);
    this.addToUpdateList();
    this.addToDisplayList();
  }
  private preUpdate(): void {
    // Update each degree point ref; only need to call populate since it overwrites by index
    this.populatePointRefs();

    if (this.targetRadius && this.targetRadius !== this.radius) this.radius = this.targetRadius;
    this.geom.radius = this.radius;
    this.geom.setPosition(this.x, this.y);
  }
  
  // Dynamically (expand | contract) the circle shape
  public async expand(toRadius: number): Promise<void> { this.targetRadius = toRadius };
  public async contract(toRadius?: number): Promise<void> { this.targetRadius = toRadius ? toRadius : 0 };

  // Forwards the geometry methods for getting points to this Game Object
  public getPoints(quantity: number): Phaser.Geom.Point[] { return this.geom.getPoints(quantity) }
  public getPoint(atAngle: number): Phaser.Geom.Point {
    const anglePoint = this.pointRefs[atAngle || 0];
    return anglePoint;
  }

  // Get initial angle vectors along ring perimeter
  private populatePointRefs (): void {
    this.geom.getPoints(360).forEach((point, i) => { this.pointRefs[i] = (point) });
  }
} 