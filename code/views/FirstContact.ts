export default class FirstContact extends Phaser.Scene {
  constructor() {super('FirstContact')};

  // Globals
  public res = {
    w: window.innerWidth,
    h: window.innerHeight,
    r: +(window.innerWidth / 2),
    l: -(window.innerWidth / 2),
    t: +(window.innerHeight / 2),
    b: -(window.innerHeight / 2),
    inset: 36,
  };
  public cursor: Phaser.GameObjects.Container;
  public AlignZones: { [key: string]: Phaser.GameObjects.Zone } = {};

  /* --- INIT | ]:[ --- */
  private camera: Phaser.Cameras.Scene2D.Camera;
  init(): void {

    // Configure the 2D camera
    this.camera = this.cameras.main;
    this.camera.centerOn(0, 0);

    // TODO: Create a list of multiple colors that the camera cycles through every 10 minutes at random
    this.camera.setBackgroundColor(0xFFAC00);

    // set the copyright text color to be visible with the given background color
    const copy = document.getElementById('copyright-notice') as HTMLPreElement;
    copy.style.color = '#000000';
    copy.style.opacity = '1';

    // Setup positioning columns and regions
    const renderRegion = this.add.zone(0, 0, this.res.w - (this.res.inset * 5), this.res.h - (this.res.inset * 5));
    const buttonsColumn = this.add.zone((this.res.r - this.res.inset) - (36 / 2), 0, 64, this.res.h - (this.res.inset * 2));
    const dot = this.add.circle(0, 0, 12, 0x000000, 0.72);

    Phaser.Display.Align.In.Center(dot, buttonsColumn);

    this.AlignZones['RenderRegion'] = renderRegion;
    this.AlignZones['ButtonsColumn'] = buttonsColumn;

    // Visualize zones for debugging | dont put this into production
    const showZones = false;
    Object.keys(this.AlignZones).forEach(k => {
      const zone = this.AlignZones[k];
      this.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0x000000, showZones ? 0.24 : 0.00);
    });
  }
  /* --- INIT | [:] --- */
  
  preload(): void {}
  
  create(): void {
    // Animated cursor
    const cursorCore = this.add.circle(0, 0, 6, 0x000000, 0.64);
    const crLeftArc = this.add.arc(-3, 0, 12, -90, +90, true).setStrokeStyle(3, 0x000000, 0.72).setClosePath(false);
    const crRghtArc = this.add.arc(+3, 0, 12, -90, +90, false).setStrokeStyle(3, 0x000000, 0.72).setClosePath(false);
    const cursorRing = this.add.container(0, 0, [crLeftArc, crRghtArc]);
    const cursorPips = this.add.container(0, 0);
    new Phaser.Geom.Circle(0, 0, 16).getPoints(3).forEach(point => {
      cursorPips.add(this.add.circle(point.x, point.y, 2, 0xFFFFFF, 1));
    });
    this.events.on('update', () => cursorPips.angle++);
    cursorRing.setScale(0.6, 0.6);
    this.cursor = this.add.container(0, 0, [cursorCore, cursorPips, cursorRing]);

    // Psuedo-page Link Buttons
    const accountBtn = this.add.circle();
    const contactBtn = this.add.circle();
    const exploreBtn = this.add.circle();
    const shoppesBtn = this.add.circle();

    // Button Physics Bodies
    // Each button is placed into a MatterJS world and are connected by spline constraint chains so that rather than clicking them
    // A visitor "plucks" them like a guitar string, or can pull them down like stage curtain ropes
  }
  
  update(): void {
    this.cursor.setPosition(this.input.activePointer.worldX, this.input.activePointer.worldY);
  }
  
  postUpdate(): void {}
}