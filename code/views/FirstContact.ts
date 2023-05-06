export default class FirstContact extends Phaser.Scene {
  constructor() {super('FirstContact')};

  // Globals
  public res = {
    w: window.innerWidth,
    h: window.innerHeight,
    inset: 36
  };
  public cursor: Phaser.GameObjects.Container;

  /* --- INIT | ]:[ --- */
  private camera: Phaser.Cameras.Scene2D.Camera;
  init(): void {

    // Configure the 2D camera
    this.camera = this.cameras.main;
    this.camera.centerOn(0, 0);
    this.camera.setBackgroundColor(0xFFAC00);

    // set the copyright text color to be visible with the given background color
    const copy = document.getElementById('copyright-notice') as HTMLPreElement;
    copy.style.color = '#000000';
    copy.style.opacity = '1';

    // Setup positioning column for buttons on right-hand edge
    this.add.circle(this.res.w / 2 - this.res.inset, 0, 12, 0xFFFFFF, 0.72);
    this.add.rectangle(this.res.w / 2 - this.res.inset);
  }
  /* --- INIT | [:] --- */
  
  preload(): void {}
  
  create(): void {

    // Psuedo-page Link Buttons
    const accountBtn = this.add.circle();
    const contactBtn = this.add.circle();
    const exploreBtn = this.add.circle();
    const shoppesBtn = this.add.circle();
  }
  
  preUpdate(): void {}
  
  update(): void {}
  
  postUpdate(): void {}
}