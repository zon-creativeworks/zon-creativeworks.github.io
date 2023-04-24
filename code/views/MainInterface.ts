import * as Tone from 'tone';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { threeCanvas, phaseCanvas } from '../index';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import { 
  AdaptiveToneMappingPass, 
  AfterimagePass, 
  FXAA, 
  FilmPass, 
  GlitchPass, 
  OutlinePass,
  UnrealBloomPass 
} from '../components/manager/PostProcessing';


export default class MainInterface extends Phaser.Scene {

  // Props - ThreeJS
  private camera3D: THREE.OrthographicCamera;
  private rootScene = new THREE.Scene();
  private rootRenderer: THREE.WebGLRenderer;
  private phaseTexture: THREE.CanvasTexture;

  // Props - Audio
  private onlineTD = new Date();
  private bell10M: Tone.Player;
  private bell01H: Tone.Player;
  private played01H: boolean = false;
  private played10M: boolean = false;

  // Props - Phaser3
  private camera2D: Phaser.Cameras.Scene2D.Camera;

  // Props - Globals
  public res: {w: number, h: number}
  public isMobile: boolean;
  public nearField: number = 0.1e-3;
  public distField: number = 10.0e3;
  public aspectRatio: number;
  public fieldOfView: number = 60;
  public isQuietTime: boolean = false;

  // Pointer Tracking
  public cursor: {x: number, y: number} = { x: 0, y:0 };
  public getCursor(): {x: number, y: number} { return this.cursor };

  // Interactive Element - Callback Boilerplate
  public handleInteraction(area: Phaser.Geom.Circle, handlers: { 
    onHover?: (cPos: {x: number, y: number}) => void, 
    onClick?: (cPos: {x: number, y: number}) => void, 
    onTouch?: (cPos: {x: number, y: number}) => void
  }): void {
    const isHover = area.contains(this.cursor.x, this.cursor.y);
    const isClick = isHover && this.input.activePointer.isDown;
    const isTouch = this.input.mousePointer.wasTouch;
      if (isHover && handlers.onHover) handlers.onHover(this.getCursor());
      else
      if ((isClick || isTouch) && handlers.onClick) handlers.onClick(this.getCursor());
      else
      if (isTouch && handlers.onTouch) handlers.onTouch(this.getCursor());
  }

  constructor() {
    super('MainInterface');

    // Ensure canvas sizes are correct
    phaseCanvas.width = window.innerWidth;
    phaseCanvas.height = window.innerHeight;
    threeCanvas.width = window.innerWidth;
    threeCanvas.height = window.innerHeight;

    this.res = {
      w: window.innerWidth, 
      h: window.innerHeight,
    };
    this.aspectRatio = this.res.w / this.res.h;

    // The main renderer that will be used for compositing and applying FX
    this.rootRenderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true, 
      canvas: threeCanvas, 
    });
    this.rootRenderer.setSize(this.res.w, this.res.h);
    this.rootRenderer.setPixelRatio(window.devicePixelRatio);

    // The 2D texture from the Phaser Canvas that will be rendered into the final composition
    this.phaseTexture = new THREE.CanvasTexture(phaseCanvas);
  }

  preload(): void {

    // Avatar Base Vectors
    this.load.svg('TiLLI', 'code/res/icons/TiLLI.svg', {scale: 0.55});
    this.load.svg('Tapehead-Base', 'code/res/icons/TapeHead_NoSpoke.svg', {scale: 0.55});
    this.load.svg('Tapehead-SpokeEye', 'code/res/icons/TapeHead_SpokeOnly.svg', {scale: 0.55});

    // Mode Icons
    this.load.svg('eben', 'code/res/icons/modes/eben.svg', {scale: 0.12});
    this.load.svg('wandry', 'code/res/icons/modes/wandry.svg', {scale: 0.2})
    this.load.svg('tapehead', 'code/res/icons/modes/tapehead.svg', {scale: 0.12});
    this.load.svg('tillibot', 'code/res/icons/modes/tillibot.svg', {scale: 0.12});
    this.load.svg('robohobb', 'code/res/icons/modes/robohobb.svg', {scale: 0.12});

    // Sensors & Permissions Icons
    this.load.svg('gyro', 'code/res/icons/sensors/gyro.svg', {scale: 0.16});
    this.load.svg('settings', 'code/res/icons/settings.svg', {scale: 0.06});
    this.load.svg('transcript', 'code/res/icons/transcript.svg', {scale: 0.06});
  }

  init(): void {

    // Bezel Glow - Doesn't ever need to be messed with
    this.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF, alpha: 0.32 }})
    .strokeRect(
      -this.res.w / 2, -this.res.h / 2, 
      window.innerWidth, window.innerHeight
    );

    // Maintain a constant cursor position by world offset
    this.events.on('preupdate', () => this.cursor = {x: this.input.activePointer.worldX, y: this.input.activePointer.worldY});
    
    // The camera used to render items from orthographic "flatland" sprites into perspective 3D
    this.camera3D = new THREE.OrthographicCamera(
      -this.res.w /2, +this.res.w /2,
      -this.res.h / 2, +this.res.h / 2,
      0.001, 10000
    );

    const pxInset = 26;
    const maxCornerTL = new Phaser.Math.Vector2(-(this.res.w / 2) + pxInset, -(this.res.h / 2) + pxInset);
    const maxCornerTR = new Phaser.Math.Vector2(+(this.res.w / 2) - pxInset, -(this.res.h / 2) + pxInset);
    const maxCornerBL = new Phaser.Math.Vector2(-(this.res.w / 2) + pxInset, +(this.res.h / 2) - pxInset);
    const maxCornerBR = new Phaser.Math.Vector2(+(this.res.w / 2) - pxInset, +(this.res.h / 2) - pxInset);

        // Text Interface SFX
    const open = new Tone.Player('code/res/audio/terminalOpen.wav').toDestination();
    const shut = new Tone.Player('code/res/audio/terminalClose.wav').toDestination();
    
    // Define the 2D camera
    this.camera2D = this.cameras.main;
    this.camera2D.centerOn(0, 0);
  }

  // Called once Phaser.Scene has been fully initialized; Useful for setting up physics, etc.
  create(): void {
    // System Audio Components
    const mainVolume = new Tone.Volume(-9).toDestination();
    const aye = new Tone.Player('code/res/audio/aye.wav').connect(mainVolume);
    const nay = new Tone.Player('code/res/audio/nay.wav').toDestination();
    const activate = new Tone.Player('code/res/audio/activate.wav').connect(mainVolume);
    const deactivate = new Tone.Player('code/res/audio/deactivate.wav').toDestination();
    const staticPulse = new Tone.Player('code/res/audio/static_pulse.wav').toDestination();
    const notificationPing = new Tone.Player('code/res/audio/notificationPing.wav').toDestination();

    // Menu Audio Components
    const menuOpen = new Tone.Player('code/res/audio/openMenu.wav').toDestination();
    const menuClose = new Tone.Player('code/res/audio/closeMenu.wav').toDestination();
    const menuSelect = new Tone.Player('code/res/audio/menuSelect.wav').toDestination();

        // Background SFX List
    const subVol = new Tone.Volume(-12).toDestination();

    const FX: Tone.Player[] = [
      new Tone.Player('code/res/audio/ScreenHum.wav').toDestination(),
      new Tone.Player('code/res/audio/EMF_Noise.wav').toDestination(),
      new Tone.Player('code/res/audio/scannerFX.wav').connect(subVol),
      new Tone.Player('code/res/audio/BrokenSig.wav').connect(subVol),
    ];
    
    // Select and play a random BG SFX every 30 seconds to 2 minutes
    const playFX = () => setTimeout(() => {
      const fxPlayer = (Phaser.Utils.Array.GetRandom(FX) as Tone.Player);
      if (fxPlayer.state === 'stopped') fxPlayer.start();
      !this.isQuietTime && playFX();
    }, Phaser.Math.Between(30_000, 120_000));
    playFX();

    // Timing Bells
    const bellVolume = new Tone.Volume(-3).toDestination();
    this.bell01H = new Tone.Player('code/res/audio/Bell01H.wav').connect(bellVolume);
    this.bell10M = new Tone.Player('code/res/audio/Bell10M.wav').connect(bellVolume);
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

    // Setup Spatial Movement and Orientation Detectors - Used for sound playback via gestures in Tapehead's Mandorla Mode 
    type Sensor = {
      activated : boolean,
      hasReading: boolean,
      onactivate: null | (() => void),
      onerror: null | (() => void),
      onreading: null | (() => void),
      x: null | number,
      y: null | number,
      z: null | number,
    };

    let gyroscope: Sensor | undefined;
    let accelerometer: Sensor | undefined;
    let gravitySensor: Sensor | undefined;

    if ('Accelerometer' in window) {
      // @ts-ignore | object exists, type definitions are just lacking (as usual)
      accelerometer = new window['Accelerometer']() as Sensor;
    }
    if ('Gyroscope' in window) {
      // @ts-ignore | object exists, type definitions are just lacking (as usual)
      gyroscope = new Gyroscope({ frequency: 60 }) as Sensor;
    }
    if ('GravitySensor' in window) {
      // @ts-ignore | object exists, type definitions are just lacking (as usual)
      gravitySensor = new window['GravitySensor'] as Sensor;
    }

    // Debugger Output - Display when TI is opened
    let debugOutput = ``;
    const Debugger = this.add.text(-(this.res.w / 2) + 36, -(this.res.h / 2) + 36, debugOutput, {
      fontSize: '12px',
      color: '#FFFFFF'
    });

    let deviceMotionX: number | null | undefined = -Infinity;
    let deviceMotionY: number | null | undefined = -Infinity;
    let deviceMotionZ: number | null | undefined = -Infinity;
    let deviceRotationAlpha: number | null | undefined = -Infinity;
    let deviceRotationBeta: number | null | undefined = -Infinity;
    let deviceRotationGamma: number | null | undefined = -Infinity;
    let deviceOrientationAlpha: number | null | undefined = -Infinity;
    let deviceOrientationBeta: number | null | undefined = -Infinity;
    let deviceOrientationGamma: number | null | undefined = -Infinity;

    window.addEventListener('devicemotion', (dme: DeviceMotionEvent) => {
      deviceMotionX = dme.acceleration?.x;
      deviceMotionY = dme.acceleration?.y;
      deviceMotionZ = dme.acceleration?.z;
      deviceRotationAlpha = dme.rotationRate?.alpha;
      deviceRotationBeta = dme.rotationRate?.beta;
      deviceRotationGamma = dme.rotationRate?.gamma;
    });
    window.addEventListener('deviceorientation', (doe: DeviceOrientationEvent) => {
      deviceOrientationAlpha = doe.alpha;
      deviceOrientationBeta = doe.beta;
      deviceOrientationGamma = doe.gamma;

      // deviceOrientationAlpha && (this.activeAvatar.angle = Phaser.Math.Wrap(deviceOrientationAlpha, -180, +180) - 90);
    });

    let touchStart = false;
    let touchEnd = false;
    let touchCancel = false;
    let dragStart = false;
    let isDragging = false;
    let dragEnd = false;
    let doubleClick = false;

    window.addEventListener('dblclick', () => {
      doubleClick = true;
      setTimeout(() => doubleClick = false, 1000);
    });
  
    window.ontouchstart = () => {
      touchStart = true;
      touchEnd = false;
    }
    window.ontouchend = () => {
      touchEnd = true;
      touchStart = false;
    };
    window.ontouchmove = (m: TouchEvent) => {
      console.debug(m)
    };

    // Setup Post-Processing and FX for Three
    const comp = new EffectComposer(this.rootRenderer);
    const vec2res = new THREE.Vector2(this.res.h, this.res.w); /* for passes that require a vec2 resolution */

    // Base renders to apply all post-processing FX to
    const rootPass = new TAARenderPass(this.rootScene, this.camera3D, 0xAF77AF, 0.54);
    const tx2DPass = new TexturePass(this.phaseTexture, 0.9);

    // Bloom & Glow FX
    const hazyGlow = new UnrealBloomPass(vec2res, 0.63, 0.003, 0.001);

    // Aesthetic FX
    const retroCRT = new FilmPass(0.35, 0.64, window.screen.height * 2, 0);
    const timeHaze = new AfterimagePass(0.3);
    const normalize = new AdaptiveToneMappingPass(true, 64);

    // Glitch effect to be triggered during scene transitions
    const transGlitch = new GlitchPass(-1);
    transGlitch.randX = 0.001;
    transGlitch.curF = 0.00001;
    transGlitch.enabled = false;
    
    // Post-Processing "stack" - ordering sensitive
    comp.addPass(rootPass);
    comp.addPass(tx2DPass);
    // comp.addPass(contours);
    comp.addPass(transGlitch);
    comp.addPass(timeHaze);
    comp.addPass(hazyGlow);
    comp.addPass(normalize);
    comp.addPass(retroCRT);
    comp.addPass(FXAA);

    // periodically reset the internal clock for the retroCRT shader to mitigating banding;
    setInterval(() => {
      retroCRT.uniforms['time'] = new THREE.Uniform(0);
    }, 3000);

    this.events.on('update', () => {comp.render()});
  }

  update(): void {
    this.phaseTexture.needsUpdate = true;
    this.camera3D.updateProjectionMatrix();
    this.camera3D.updateWorldMatrix(true, true);
  }
}