import * as Tone from 'tone';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

export default class Manager2D {



  private camera: THREE.OrthographicCamera;

  // Props - Globals
  public res: {w: number, h: number}
  public isMobile: boolean;


  // Pointer Tracking
  public cursor: {x: number, y: number} = { x: 0, y:0 };
  public getCursor(): {x: number, y: number} { return this.cursor };

  // // Interactive Element - Callback Boilerplate
  // public handleInteraction(area: Phaser.Geom.Circle, handlers: { 
  //   onHover?: (cPos: {x: number, y: number}) => void, 
  //   onClick?: (cPos: {x: number, y: number}) => void, 
  //   onTouch?: (cPos: {x: number, y: number}) => void
  // }): void {
  //   const isHover = area.contains(this.cursor.x, this.cursor.y);
  //   const isClick = isHover && this.input.activePointer.isDown;
  //   const isTouch = this.input.mousePointer.wasTouch;
  //     if (isHover && handlers.onHover) handlers.onHover(this.getCursor());
  //     else
  //     if ((isClick || isTouch) && handlers.onClick) handlers.onClick(this.getCursor());
  //     else
  //     if (isTouch && handlers.onTouch) handlers.onTouch(this.getCursor());
  // }

  constructor() {
    this.res = {
      w: window.innerWidth, 
      h: window.innerHeight,
    };
  }

  load(): void {
    const svgLoader = new SVGLoader();
    const texLoader = new THREE.TextureLoader();
  }

  // Called once Phaser.Scene has been fully initialized; Useful for setting up physics, etc.
  setup(): void {
    
    // Use the screen properties to determine if the device is mobile or not
    /* if orientation is portrait at an angle of 0 degrees, the device is mobile due to candybar design */
    this.isMobile = (
      window.screen.orientation.type === 'portrait-primary' && window.screen.orientation.angle === 0
      ||
      window.screen.orientation.type === 'landscape-primary' && window.screen.orientation.angle === 90
    );
  }

  // The canvas texture generated by this class
  public outTexture: THREE.CanvasTexture;

  private animate(): void {}
  private doRender(): void {}
}