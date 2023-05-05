import * as THREE from "three";
import Container3D from "./Container3D";
import Manager3D from "../../../views/Manager3D";


// A specialized Phaser Scene that contains its own Three.js renderer, composer, scene, and camera
// However, since all derivatives of this class will target the same canvas, these scenes should be run instead of launched
// In the process of removing or suspending a given MMV scene, the renderer targeting the canvas should be stopped to avoid race conditions
export default class MixedMediaView extends Phaser.Scene {
  private scene3D: THREE.Scene;
  private viewName: string = 'MixedMediaView';

  constructor(viewName?: string) {
    super(viewName || 'MixedMediaView');
    viewName && (this.viewName = viewName);
    
    const loadedScene: string | undefined = window['ActiveScene'];

    // if a different MMV is already defined, unload that scene prior to starting this one
    if (loadedScene && loadedScene !== this.viewName) this.game.scene.remove(loadedScene);

    // Assign this MMV view name name to the window; 
    window['ActiveScene'] = viewName || 'MixedMediaView';
  }

  init(): void {
    console.debug(`--- ${this.viewName} Loaded ---`);
    this.cameras.main.centerOn(0, 0);

    // Cursor Overlay
    const cursor2D = this.add.circle(0, 300, 6, 0xFF0000).setStrokeStyle(3, 0xFFFFFF).setDepth(1e9);
    this.events.on('update', () => {
      cursor2D.setX(this.input.activePointer.worldX);
      cursor2D.setY(this.input.activePointer.worldY);
    });
  }
  create(): void {
    // --- Three.js | 3D Layers ---
    const manager3D = new Manager3D(); // TODO: Refactor to have this integrated with MMV scenes instead of instatiated within them
    this.scene3D = manager3D.scene;    // TODO: See above

    const overlay2D = this.add.graphics()
      .lineStyle(3, 0xFFFFFF)
      .fillStyle(0x000000, 0.12)
      .fillRoundedRect(-(window.innerWidth / 2) + 60, -460, window.innerWidth - 108, 800)
      .strokeRoundedRect(-(window.innerWidth / 2) + 60, -460, window.innerWidth - 108, 800)
    ;

    const i2D_Backplate = this.add.circle(0, 0, 45, 0x000000).setStrokeStyle(3, 0xFFFFFF);
    const i2D_Foreplate = this.add.circle(0, 0, 32, 0xFFFFFF).setStrokeStyle(3, 0xFFAC00);
    const interactron2D = this.add.container(0, 400, [i2D_Backplate, i2D_Foreplate]);

    // 2D Overlay Elements (rendered on top of the Three.js canvas instead of within it)
    const can3D = new Container3D(0, 0, this);
  }
  update(): void {}
}