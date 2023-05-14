import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import { AdaptiveToneMappingPass, AfterimagePass, FXAA, FilmPass, GlitchPass, TexturePass, UnrealBloomPass } from "../components/controller/PostProcessing";

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
  private UITexture: THREE.CanvasTexture;
  private composer: EffectComposer;
  private camera: Phaser.Cameras.Scene2D.Camera;

  init(): void {

    // Configure the 2D camera
    this.camera = this.cameras.main;
    this.camera.centerOn(0, 0);

    // Create a texture from the parent Phaser instance's canvas
    this.UITexture = new THREE.CanvasTexture(this.game.canvas);

    // Setup positioning columns and regions
    const renderRegion = this.add.zone(0, 0, this.res.w - (this.res.inset * 5), this.res.h - (this.res.inset * 5));

    // Needs two separate columns; top and bottom - 2 buttons each
    const buttonsColumn = this.add.zone((this.res.r - this.res.inset) - (36 / 2), 0, 64, this.res.h - (this.res.inset * 2));

    this.AlignZones['RenderRegion'] = renderRegion;
    this.AlignZones['ButtonsColumn'] = buttonsColumn;

    // Visualize zones for debugging | dont put this into production
    const showZones = false;
    Object.keys(this.AlignZones).forEach(k => {
      const zone = this.AlignZones[k];
      this.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0x000000, showZones ? 0.24 : 0.00);
    });
  }

  preload(): void {}
  
  create(): void {
    const scene3D = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      canvas: document.getElementById('three') as HTMLCanvasElement 
    });
    renderer.setSize(this.res.w, this.res.h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMappingExposure = 1;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.composer = new EffectComposer(renderer);
    const camera3D = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 10000);
    camera3D.position.z = 45;

    // Add the 3D scene objects
    const knotG = new THREE.TorusKnotGeometry(10, 2, 128, 64);
    const knotM = new THREE.MeshToonMaterial();
    const tKnot = new THREE.Mesh(knotG, knotM);
    scene3D.add(tKnot);

    this.events.on('update', () => tKnot.rotation.z += 0.01);

    // Fetch the UI offscreen canvas to rasterize
    const UI2D = new TexturePass(this.UITexture, 0.9);
    const base = new TAARenderPass(scene3D, camera3D, 0xFFAC00, 0.5);
    const vec2res = new THREE.Vector2(this.res.h, this.res.w); /* for passes that require a vec2 resolution */

    const timeHaze = new AfterimagePass(0.72);
    const hazyGlow = new UnrealBloomPass(vec2res, 0.63, 0.003, 0.001);

    // Glitch effect to be triggered during view transitions
    const transGlitch = new GlitchPass(-1);
    transGlitch.randX = 0.001;
    transGlitch.curF = 0.00001;
    transGlitch.enabled = false;
    
    // Post-Processing "stack" - ordering sensitive
    this.composer.addPass(base);
    this.composer.addPass(UI2D);
    this.composer.addPass(timeHaze);
    this.composer.addPass(hazyGlow);
    this.composer.addPass(transGlitch);

    // TODO: This could probably be its own class
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
    const buttonWidth = 42;
    const buttonHeight = 112;
    const cornerRadius = 6;

    const accountBtn = this.add.container(0, 0);
    const accountGFX = this.add.graphics()
      .fillStyle(0xFFFFFF, 0.72)
      .lineStyle(6, 0x000000, 1);
    accountGFX.fillRoundedRect(0, 0, buttonWidth, buttonHeight, cornerRadius);
    accountGFX.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, cornerRadius);
    accountGFX.setPosition(-buttonWidth / 2, -buttonHeight / 2)
    const accountTxt = this.add.text(0, 0, 'HIRE ME', {
      color: '#FFAC00',
      fontSize: '18pt',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    })
    .setOrigin()
    .setAngle(90);
    accountBtn.add([accountGFX, accountTxt]);

    // Position ze buttons
    Phaser.Display.Align.In.Center(accountBtn, this.AlignZones['ButtonsColumn'] as Phaser.GameObjects.Zone);

    // Button Physics Bodies
    // Each button is placed into a MatterJS world and are connected by spline constraint chains so that rather than clicking them
    // A visitor "plucks" them like a guitar string, or can pull them down like stage curtain ropes
  }
  
  update(): void {
    this.UITexture.needsUpdate = true;
    this.composer.render();
    this.cursor.setPosition(this.input.activePointer.worldX, this.input.activePointer.worldY);
  }
}