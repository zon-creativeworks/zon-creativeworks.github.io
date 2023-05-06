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
    const renderRegionVisualizer = this.add.rectangle(renderRegion.x, renderRegion.y, renderRegion.width, renderRegion.height, 0x000000, 0.24);
    const buttonsColumn = this.add.zone((this.res.r - this.res.inset) - (36 / 2), 0, 64, this.res.h - (this.res.inset * 2));
    const columnVisualizer = this.add.rectangle(buttonsColumn.x, buttonsColumn.y, buttonsColumn.width, buttonsColumn.height, 0xAC0000, 0.36);
    const dot = this.add.circle(0, 0, 12, 0x000000, 0.72);

    Phaser.Display.Align.In.Center(dot, buttonsColumn);
  }
  /* --- INIT | [:] --- */
  
  preload(): void {}
  
  create(): void {

    // Psuedo-page Link Buttons
    const accountBtn = this.add.circle();
    const contactBtn = this.add.circle();
    const exploreBtn = this.add.circle();
    const shoppesBtn = this.add.circle();

    // Button Physics Bodies
    // Each button is placed into a MatterJS world and are connected by spline constraint chains so that rather than clicking them
    // A visitor "plucks" them like a guitar string, or can pull them down like stage curtain ropes
  }
  
  preUpdate(): void {}
  
  update(): void {}
  
  postUpdate(): void {}
}