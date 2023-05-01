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
  UnrealBloomPass, 
  AnaglyphEffect,
  HalftonePass,
  OutlineEffect
} from '../components/manager/PostProcessing';
import { ColorifyShader } from 'three/examples/jsm/shaders/ColorifyShader';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';


export default class MainInterface extends Phaser.Scene {

  // Props - ThreeJS
  private rootScene = new THREE.Scene();
  private camera3D: THREE.PerspectiveCamera;
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

    // The main renderer that will be used for compositing and applying FX
    this.rootRenderer = new THREE.WebGL1Renderer({ 

      canvas: threeCanvas,
      
      alpha: true,
      depth: false,
      antialias: true, 
      logarithmicDepthBuffer: true,

      precision: 'highp',
      powerPreference: 'high-performance',
    });

    this.rootRenderer.setSize(this.res.w, this.res.h);
    this.rootRenderer.setPixelRatio(window.devicePixelRatio);
    this.rootRenderer.toneMappingExposure = 1.2;
    this.rootRenderer.toneMapping = THREE.ACESFilmicToneMapping;

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
    this.camera3D = new THREE.PerspectiveCamera(42, this.res.w / this.res.h, 1e-4, 1e4);
    this.camera3D.position.set(0, 0, 90);

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

    // Setup Post-Processing and FX for Three
    const comp = new EffectComposer(this.rootRenderer);
    const vec2res = new THREE.Vector2(this.res.h, this.res.w); /* for passes that require a vec2 resolution */


    const rootPass = new TAARenderPass(this.rootScene, this.camera3D, 0x9A5CBF, 0.24);
    const tx2DPass = new TexturePass(this.phaseTexture, 0.9);

    // Bloom & Glow FX
    const hazyGlow = new UnrealBloomPass(vec2res, 0.36, 0.09, 0.09);

    // Aesthetic FX
    const retroCRT = new FilmPass(0.36, 0.12, 2048, 0);
    const timeHaze = new AfterimagePass(0.36);

    // Glitch effect to be triggered during scene transitions
    const transGlitch = new GlitchPass(-1);
    transGlitch.randX = 0.001;
    transGlitch.curF = 0.00001;
    transGlitch.enabled = false;

		const textureLoader = new THREE.TextureLoader();

		const envMap = textureLoader.load( 'code/res/hdri/glasswater.jpg' );
		envMap.mapping = THREE.EquirectangularReflectionMapping;

    const prismG = new THREE.IcosahedronGeometry(20, 9);
    const inkAndGrain = new THREE.MeshPhysicalMaterial({

      color: 0xFFAC00,
      opacity: 1.0,
      blending: THREE.NormalBlending,

      metalness: 0.0,
      roughness: 0.3,

      reflectivity: 0.8,

      dithering: true,
      flatShading: false,

      toneMapped: true,
      transparent: true,
      precision: 'highp',
      
      envMap: envMap,
      envMapIntensity: 1,
      side: THREE.BackSide,
    });

    const prism = new THREE.Mesh(prismG, inkAndGrain);
    // prism.position.set(0, 0, -1000);

    // Main Lighting Rig
    const spotA = new THREE.SpotLight(0xFFFFFF, 90, 90, 180, 0, 12);
    spotA.position.set(0, 0, 60);

    const boxG = new THREE.BoxGeometry(10, 10, 10);
    const FlatBlack = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const cube = new THREE.Mesh(boxG, FlatBlack);
    cube.rotation.set(Phaser.Math.DegToRad(45), 0, 0);

    this.rootScene.add(
      prism, 
      cube,
      spotA,
      // new THREE.PointLight(0xFFFFFF, 1)
    );
    this.events.on('update', () => prism.rotation.y+=0.01);

    const lineArt = new OutlinePass(new THREE.Vector2(this.res.w, this.res.h), this.rootScene, this.camera3D, [prism]);
    lineArt.edgeThickness = 1;
    lineArt.edgeStrength = 16;
    lineArt.visibleEdgeColor = new THREE.Color(0, 0, 0);
    lineArt.hiddenEdgeColor = new THREE.Color(1, 1, 1);

    const FXAntiAlias = FXAA;
    FXAntiAlias.uniforms['resolution'] = new THREE.Uniform(new THREE.Vector2(this.res.w, this.res.h));
    console.debug(FXAntiAlias.uniforms)

    
    // TAA Base Pass
    comp.addPass(rootPass);
    comp.addPass(FXAntiAlias);
    
    // Initial FX
    comp.addPass(lineArt);
    comp.addPass(hazyGlow);

    // Final FX
    comp.addPass(tx2DPass);
    comp.addPass(retroCRT);
    comp.addPass(timeHaze);

    // Dynamic FX
    comp.addPass(transGlitch);

    // this.add.circle(0, 0, 60, 0x000000);

    // periodically reset the internal clock for the retroCRT shader to mitigating banding;
    setInterval(() => {
      retroCRT.uniforms['time'] = new THREE.Uniform(0);
    }, 30000);

    this.rootRenderer.compile(this.rootScene, this.camera3D);
    this.events.on('update', () => {
      comp.render();
    });
  }

  update(): void {
    this.phaseTexture.needsUpdate = true;
    this.camera3D.updateProjectionMatrix();
    this.camera3D.updateWorldMatrix(true, true);
  }
}