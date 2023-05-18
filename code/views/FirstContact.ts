import Phaser from "phaser";
import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import { 
    AdaptiveToneMappingPass, 
    AfterimagePass, 
    AnaglyphEffect, 
    DotScreenPass, FXAA, FilmPass, GlitchPass, OutlineEffect, OutlinePass, RenderPixelatedPass, TexturePass, UnrealBloomPass } from "../components/controller/PostProcessing";
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes';
import { lerp } from "three/src/math/MathUtils";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

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
  private scene3D: THREE.Scene = new THREE.Scene();

  init(): void {

    // Configure the 2D camera
    this.camera = this.cameras.main;
    this.camera.centerOn(0, 0);

    // Create a texture from the parent Phaser instance's canvas
    this.UITexture = new THREE.CanvasTexture(this.game.canvas);

    // Setup positioning columns and regions
    const renderRegion = this.add.zone(0, 0, this.res.w - (this.res.inset * 5), this.res.h - (this.res.inset * 5));

    // Needs two separate columns; top and bottom - 2 buttons each
    const buttonsColumn = this.add.zone((this.res.r - this.res.inset) + 12, 0, 64, this.res.h - (this.res.inset * 2));

    this.AlignZones['RenderRegion'] = renderRegion;
    this.AlignZones['ButtonsColumn'] = buttonsColumn;

    // Visualize zones for debugging | dont put this into production
    const showZones = false;
    Object.keys(this.AlignZones).forEach(k => {
      const zone = this.AlignZones[k];
      this.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0x000000, showZones ? 0.24 : 0.00);
    });
  }

  preload(): void {

    this.load.svg('ZoN_Ring', 'code/assets/svg/ZoN_Ring.svg', { scale: 11});

    this.load.svg('Copyright_Stamp', 'code/assets/svg/CopyrightStamp.svg', { scale: 8 });

    this.load.svg('Logo_CreativeWorks', 'code/assets/svg/CreativeWorks.svg', { scale: 8 });

    // Using OBJ is more streamlined than GLTF as it does not create a whole scene
    const modelLoader = new OBJLoader();
    modelLoader.path = 'code/assets/models/';
    modelLoader.load('Apps Label.obj', (obj: THREE.Group) => { // add the pill frame once the artifacts caused on it by the outline pass have been resolved

      // @ts-ignore | false flag by incomplete type defs
      const appsLabel: THREE.Mesh = obj.children.filter((mesh: THREE.Mesh) => {return mesh.name === 'Apps_Label' })[0];

        const mat_AppsLabel = new THREE.MeshBasicMaterial({
          blending: THREE.NormalBlending,
          color: 0xFFFFFF,
          dithering: true,
          vertexColors: true,
          side: THREE.FrontSide
        });
        appsLabel.material = mat_AppsLabel;

        appsLabel.scale.set(10, 10, 10);
        appsLabel.position.set(0, 13, 1);
      
      this.scene3D.add(appsLabel);

      this.events.on('update', () => {
        appsLabel.rotation.y += 0.01;
      });
    });
  }
  
  create(): void {

    // The UI Bits & Bobs
    this.add.circle(0, 0, 12, 0x000000, 1)
    .setStrokeStyle(3, 0xFFFFFF, 1);

    this.add.image(0, 0, 'ZoN_Ring');
    this.add.image(0, (this.res.h / 2) -420, 'Copyright_Stamp').setAlpha(0.24);
    this.add.image(0, 42, 'Logo_CreativeWorks');
    // this.add.image(-24, -200, 'For_Hire_Button');

    const follower = this.add.circle(0, 0, 24).setStrokeStyle(6, 0xFF0000, 1);
    this.events.on('update', (t: number, d: number) => {
      if (this.input.activePointer.isDown) {
        follower.setPosition(this.cursor.x, this.cursor.y)
      } else {
        follower.setPosition(0, 0);
      }
    });

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
    camera3D.position.z = 64;

    // Add the 3D scene objects
    const knotG = new THREE.TorusKnotGeometry(6 * (window.innerWidth / window.innerHeight), 2 * (window.innerWidth / window.innerHeight), 128, 64);
    const TwoToneWhite = new THREE.MeshToonMaterial({
      color: 0xFFFFFF, 
      emissive: 0xFFFFFF, 
      emissiveIntensity: 0.03,
      dithering: true,
      fog: true,
      forceSinglePass: true,
      name: 'dummy_knot',
      opacity: 1,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      precision: 'highp',
      toneMapped: true,
      vertexColors: false,
    });
    
    const tKnot = new THREE.Mesh(knotG, TwoToneWhite);

    // Setup scene lighting
    const light = new THREE.PointLight(0x66ACFF, 0.26);
    this.scene3D.add(tKnot, light);

    this.events.on('update', () => {
      tKnot.rotation.z += 0.01; 
      tKnot.rotation.y += 0.01;
      light.position.x = this.cursor.x;
      light.position.y = -this.cursor.y;
    });
    light.position.z = 20;

    // Fetch the UI offscreen canvas to rasterize
    const UI2D = new TexturePass(this.UITexture, 0.9);
    const base = new TAARenderPass(this.scene3D, camera3D, 0xFFAC00, 0.5);
    const vec2res = new THREE.Vector2(this.res.h, this.res.w); /* for passes that require a vec2 resolution */

    const motionBlur = new AfterimagePass(0.24);
    const diffuseBloom = new UnrealBloomPass(vec2res, 0.63, 0.003, 0.001);

    // outlines
    const olTarget = new OffscreenCanvas(this.res.w, this.res.h);
    const olRender = new THREE.WebGLRenderer({ canvas: olTarget, alpha: true, antialias: true, premultipliedAlpha: true });
    const tOutline = new THREE.CanvasTexture(olTarget);

    const outlines = new OutlineEffect(olRender, {
      defaultColor: [0x00,0x00, 0x00],
      defaultThickness: 0.003,
    });
    
    this.events.on('update', () => {
      tOutline.needsUpdate = true;
      outlines.render(this.scene3D, camera3D);
    });

    // Rasterize FX outputs
    const outlineFX = new TexturePass(tOutline, 0.9);

    // this.noLines.add(this.scene3D);

    // Glitch effect to be triggered during view transitions
    const transGlitch = new GlitchPass(-1);
    transGlitch.randX = 0.001;
    transGlitch.curF = 0.00001;
    transGlitch.enabled = false;
    
    // Post-Processing "stack" - ordering sensitive
    this.composer.addPass(base);

    // Contour outlines
    this.composer.addPass(outlineFX);

    // UI render pass
    this.composer.addPass(UI2D);
    
    // Final Post-Process Passes
    this.composer.addPass(motionBlur);
    this.composer.addPass(diffuseBloom);
    this.composer.addPass(transGlitch);

    // TODO: This could/should probably be its own class with a dedicated overlay
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