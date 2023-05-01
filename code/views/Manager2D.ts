import * as Tone from 'tone';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

export default class Manager2D {

  // Props - Audio
  private onlineTD = new Date();
  private bell10M: Tone.Player;
  private bell01H: Tone.Player;
  private played01H: boolean = false;
  private played10M: boolean = false;

  private camera: THREE.OrthographicCamera;

  // Props - Globals
  public res: {w: number, h: number}
  public isMobile: boolean;
  public isQuietTime: boolean = false;

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

    // Text Interface SFX
    const open = new Tone.Player('code/assets/audio/terminalOpen.wav').toDestination();
    const shut = new Tone.Player('code/assets/audio/terminalClose.wav').toDestination();

    // System Audio Components
    const mainVolume = new Tone.Volume(-9).toDestination();
    const aye = new Tone.Player('code/assets/audio/aye.wav').connect(mainVolume);
    const nay = new Tone.Player('code/assets/audio/nay.wav').toDestination();
    const activate = new Tone.Player('code/assets/audio/activate.wav').connect(mainVolume);
    const deactivate = new Tone.Player('code/assets/audio/deactivate.wav').toDestination();
    const staticPulse = new Tone.Player('code/assets/audio/static_pulse.wav').toDestination();
    const notificationPing = new Tone.Player('code/assets/audio/notificationPing.wav').toDestination();

    // Menu Audio Components
    const menuOpen = new Tone.Player('code/assets/audio/openMenu.wav').toDestination();
    const menuClose = new Tone.Player('code/assets/audio/closeMenu.wav').toDestination();
    const menuSelect = new Tone.Player('code/assets/audio/menuSelect.wav').toDestination();

        // Background SFX List
    const subVol = new Tone.Volume(-12).toDestination();

    const FX: Tone.Player[] = [
      new Tone.Player('code/assets/audio/ScreenHum.wav').toDestination(),
      new Tone.Player('code/assets/audio/EMF_Noise.wav').toDestination(),
      new Tone.Player('code/assets/audio/scannerFX.wav').connect(subVol),
      new Tone.Player('code/assets/audio/BrokenSig.wav').connect(subVol),
    ];
    
    // Select and play a random BG SFX every 30 seconds to 2 minutes
    const playFX = () => setTimeout(() => {
      const fxPlayer = (FX[THREE.MathUtils.randInt(0, FX.length-1)] as Tone.Player);
      if (fxPlayer.state === 'stopped') fxPlayer.start();
      !this.isQuietTime && playFX();
    }, THREE.MathUtils.randInt(30_000, 120_000));
    playFX();

    // Timing Bells
    const bellVolume = new Tone.Volume(-3).toDestination();
    this.bell01H = new Tone.Player('code/assets/audio/Bell01H.wav').connect(bellVolume);
    this.bell10M = new Tone.Player('code/assets/audio/Bell10M.wav').connect(bellVolume);
    let pastHour: number | null = null;

    Tone.Offline(() => {
      setInterval(() => {
        // Check the clock for every 5M, 10M, 1H and 2H period
        this.onlineTD.setTime(Date.now());
        !pastHour && (pastHour = this.onlineTD.getHours());

        // Don't play the bells after 11PM
        this.isQuietTime = this.onlineTD.getHours() >= 23 || this.onlineTD.getHours() <= 7;
        if (!this.isQuietTime) {
          if (this.onlineTD.getMinutes() % 10 === 0) {

            // If its a new hour, play the Hour Bell...
            if (this.onlineTD.getHours() !== pastHour) {
              !this.played01H && this.bell01H.start();
              this.played01H = true;

            // ...otherwise play the 10 Minute Bell
            } else {
              !this.played10M && this.bell10M.start(); 
              this.played10M = true;
              this.played01H = false;
            }
          } else {
            this.played10M = false;
          }
        }
      }, 1000);
    }, 0.1, 2);

    
    // Use the screen properties to determine if the device is mobile or not
    /* if orientation is portrait at an angle of 0 degrees, the device is mobile due to candybar design */
    this.isMobile = (
      window.screen.orientation.type === 'portrait-primary' && window.screen.orientation.angle === 0
      ||
      window.screen.orientation.type === 'landscape-primary' && window.screen.orientation.angle === 90
    );
  }

  update(): void {}
}