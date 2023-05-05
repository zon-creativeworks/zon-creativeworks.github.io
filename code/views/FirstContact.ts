export default class FirstContact extends Phaser.Scene {
  constructor() {super('FirstContact')};

  // Globals
  // ...
  

  private camera: Phaser.Cameras.Scene2D.Camera;
  init(): void {
    this.cameras.main.centerOn(0, 0);
    this.camera = this.cameras.main;
  }
  
  preload(): void {}
  
  create(): void {}
  
  preUpdate(): void {}
  
  update(): void {}
  
  postUpdate(): void {}
}