import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ColorifyShader } from 'three/examples/jsm/shaders/ColorifyShader';
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
} from '../../../components/controller/PostProcessing';


// A specialized Phaser Scene that contains its own Three.js renderer, composer, scene, and camera
// However, since all derivatives of this class will target the same canvas, these scenes should be run instead of launched
// In the process of removing or suspending a given MMV scene, the renderer targeting the canvas should be stopped to avoid race conditions
export default class MixedMediaView extends Phaser.Scene {

  // Props | Private | 2D
  private vName: string = '';
  private camera2: Phaser.Cameras.Scene2D.Camera;

  // Props | Private | 3D
  private composer: EffectComposer;
  private render3D: THREE.WebGLRenderer;
  private camera3: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private target3: HTMLCanvasElement = document.getElementById('three') as HTMLCanvasElement;

  // Props | Public | 2D

  // Props | Public | 3D
  public scene3: THREE.Scene;
  public meshes: { [key: string]: THREE.Mesh } = {};
  public animationGroups: { [key: string] : THREE.Group } = {};

  // Constants for quickly referencing the radian value of various angle degrees
  public RAD = {
    Deg90: THREE.MathUtils.degToRad(90),
  };



  constructor() {
    const viewName = 'MixedMediaView';
    super(viewName);
    this.vName = viewName;
    
    const loadedScene: string | undefined = window['ActiveScene'];

    // if a different MMV is already defined, unload that scene prior to starting this one
    if (loadedScene && loadedScene !== viewName) this.game.scene.remove(loadedScene);

    // Assign this MMV view name name to the window; 
    window['ActiveScene'] = viewName;
  }

  init(): void {
    // Init | 2D
    // Camera2
    this.cameras.main.centerOn(0, 0);
    this.camera2 = this.cameras.main;

    // Init | 3D
    // Camera3
    this.camera3 = new THREE.OrthographicCamera(
      -(window.innerWidth / 2) * 0.02,
      +(window.innerWidth / 2) * 0.02,
      +(window.innerHeight / 2) * 0.02,
      -(window.innerHeight / 2) * 0.02,
      -100,
      1000
    );
    this.camera3.rotation.set(0, 0, this.RAD.Deg90);

    // 3D Renderer
    this.render3D = new THREE.WebGLRenderer({ canvas: this.target3, alpha: false, antialias: true });
    this.render3D.setSize(window.innerWidth, window.innerHeight);
    this.render3D.toneMapping = THREE.ACESFilmicToneMapping;
    this.render3D.toneMappingExposure = 1.0;

    // 3D Scene (Paralog to this scene)
    this.scene3 = new THREE.Scene();

    // Load in the main UI 3D Componentse
    const loader = new GLTFLoader();
    loader.load('code/assets/models/MandorlaUI.gltf', (meshData) => {
      console.debug(meshData);

      // Orient scene composition to the camera
      meshData.scene.position.set(0, 0, 0);
      meshData.scene.rotation.set(THREE.MathUtils.degToRad(90), 0, 0);

      // Extract out child meshes to animate
      meshData.scene.children.forEach(mesh => {
        this.meshes[mesh.name] = mesh as THREE.Mesh;
        console.debug(mesh.name);
      });

      // Combine the composition with the main scene
      this.scene3.add(meshData.scene);

      // Setup post-processing and shaders
      this.composer = new EffectComposer(this.render3D);
      const vec2res = new THREE.Vector2(window.innerWidth, window.innerHeight); /* for passes that require a vec2 resolution */
      const rootPass = new TAARenderPass(this.scene3, this.camera3, 0x8E29DF, 0.3);

      // Aesthetic FX
      const retroCRT = new FilmPass(0.36, 0.12, 1024, 0);
      const hazyGlow = new UnrealBloomPass(vec2res, 0.16, 3, 0.3);

      // Glitch effect to be triggered during scene transitions
      const transGlitch = new GlitchPass(-1);
      transGlitch.randX = 0.001;
      transGlitch.curF = 0.00001;
      transGlitch.enabled = false;

      const lineArt = new OutlinePass(new THREE.Vector2(vec2res.x, vec2res.y), this.scene3, this.camera3, [meshData.scene]);
      lineArt.edgeThickness = 1;
      lineArt.edgeStrength = 3;
      lineArt.visibleEdgeColor = new THREE.Color(1, 1, 1);
      lineArt.hiddenEdgeColor = new THREE.Color(1, 1, 1);

      // For tweaking FXAA if needed
      const resolution: THREE.Vector2 = new THREE.Vector2(0.0001, 0.0001);
    
      // Rendering Stack
      this.composer.addPass(rootPass);
      this.composer.addPass(lineArt);
      this.composer.addPass(hazyGlow);
      this.composer.addPass(retroCRT);
      this.composer.addPass(FXAA);

      // Dynamic FX
      this.composer.addPass(transGlitch);

      // periodically reset the internal clock for the retroCRT shader to mitigating banding;
      setInterval(() => {
        retroCRT.uniforms['time'] = new THREE.Uniform(0);
      }, 30000);

      // Compile before entering the render loop
      this.render3D.compile(this.scene3, this.camera3);

      // Setup mesh groups
      const accelerationIndicator = new THREE.Group();
      accelerationIndicator.children.push(
        this.meshes['TorsionIndicator'],
        this.meshes['AccelerationX'],
        this.meshes['AccelerationY'],
        this.meshes['VerticalAcceleration']
      );
      
      const controllerRail = new THREE.Group();
      controllerRail.children.push(
        this.meshes['ControlRail'],
        this.meshes['RailAlphaPoint'],
        this.meshes['RailOmegaPoint'],
      );

      this.animationGroups['AccelerationIndicator'] = accelerationIndicator;
      this.animationGroups['ControllerRail'] = controllerRail;
    });

    // Cursor Overlay
    const cursor2D = this.add.circle(0, 300, 6, 0xFF0000).setStrokeStyle(3, 0xFFFFFF).setDepth(1e9);
    this.events.on('update', () => {
      cursor2D.setX(this.input.activePointer.worldX);
      cursor2D.setY(this.input.activePointer.worldY);
    });
  }


  create(): void {
    const overlay2D = this.add.graphics()
      .lineStyle(3, 0xFFFFFF)
      .fillStyle(0x000000, 0.12)
      .fillRoundedRect(-(window.innerWidth / 2) + 60, -460, window.innerWidth - 108, 800)
      .strokeRoundedRect(-(window.innerWidth / 2) + 60, -460, window.innerWidth - 108, 800)
    ;

    const i2D_Backplate = this.add.circle(0, 0, 45, 0x000000).setStrokeStyle(3, 0xFFFFFF);
    const i2D_Foreplate = this.add.circle(0, 0, 32, 0xFFFFFF).setStrokeStyle(3, 0xFFAC00);
    const interactron2D = this.add.container(0, 400, [i2D_Backplate, i2D_Foreplate]);
  }
  override update(): void {this.animate2D(), this.animate3D()};

  private animate2D(): void {}
  private animate3D(): void {
      this.camera3.updateProjectionMatrix();
    this.camera3.updateWorldMatrix(true, true);

    // --- Sensor and Interaction Synchronization ---
    // Device Motion Event => Rotation / Angular Acceleration
    if (this.meshes['TorsionIndicator']) this.meshes['TorsionIndicator'].rotation.y += 0.01;

    // acceleration X <==> device motion alpha
    if (this.meshes['AccelerationX']) this.meshes['AccelerationX'].rotation.z -= 0.1;

    // acceleration Y <==> device motion beta
    if (this.meshes['AccelerationY']) this.meshes['AccelerationY'].rotation.x += 0.1;

    // vertical acceleration / acceleration z <==> device motion gamma
    if (this.meshes['VerticalAcceleration']) this.meshes['VerticalAcceleration'].rotation.x += 0.1;

    // Device orientation relative to gravity
    if (this.meshes['RotationIndicator']) this.meshes['RotationIndicator'].rotation.y += 0.1;

    // Device magnetometer and/or gyroscope pole alignments
    if (this.meshes['NorthPole'] && this.meshes['SouthPole']) {
      this.meshes['SouthPole'].rotation.z = this.meshes['RotationIndicator'].rotation.y;
      this.meshes['NorthPole'].rotation.z = this.meshes['RotationIndicator'].rotation.y;
    }

    // Device orientation per axis
    if (this.meshes['OrientationX'] && this.meshes['OrientationY'] && this.meshes['OrientationZ']) {
      this.meshes['OrientationX'].rotation.x += 0.01;
      this.meshes['OrientationY'].rotation.y += 0.01;
      this.meshes['OrientationZ'].rotation.y -= 0.01; // using y instead of z due to localized reference frame
    }

    // TODO: These should be tweens
    this.camera3.rotation.y += (this.camera3.rotation.y < this.RAD.Deg90) ? 0.1 : 0.0;
    this.scene3.rotation.z += (this.camera3.rotation.y >= THREE.MathUtils.degToRad(90) && this.scene3.rotation.z < THREE.MathUtils.degToRad(90)) ? 0.1 : 0.0;
    this.camera3.position.z += (this.scene3.rotation.z >= THREE.MathUtils.degToRad(90) && this.camera3.position.z < 7) ? 0.3 : 0.0;

    // Whole animation groups can be selected - note: they should all share a common origin point
    if (this.animationGroups['ControllerRail']) this.animationGroups['ControllerRail'].children.forEach(mesh => {
      mesh.rotation.y -= 0.01;
    });

    // Once the composer is available, render it's current frame
    this.composer && this.composer.render();
  }
}