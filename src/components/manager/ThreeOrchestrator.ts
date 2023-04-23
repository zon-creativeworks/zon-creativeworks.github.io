import * as THREE from 'three';
import { threeCanvas, phaseCanvas, screenCanvas } from '../../index';
import {
  FilmPass,
  RenderPass,
  UnrealBloomPass,
  EffectComposer,
  OutlinePass,
  FXAA,
} from './PostProcessing';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
const renderConfig = {
  depth: true, 
  antialias: true, 
  precision: 'highp', 
  preserveDrawingBuffer: true,
  logarithmicDepthBuffer: true, 
  powerPreference: 'high-performance', 
};

export interface Repository3D {
  material: { [key: string]: THREE.Material };
  geometry: { [key: string]: THREE.BufferGeometry };
  textures: THREE.Texture[]
}
export interface Repository2D {}

export default class ThreeOrchestrator extends Phaser.Scene {
  constructor() {super('ThreeOrchestrator')}

  // Scene Layers
  public mainLayer: THREE.Scene = new THREE.Scene();
  public compLayer: THREE.Scene = new THREE.Scene();

  // Cameras
  public camera2: Phaser.Cameras.Scene2D.Camera;
  public camera3: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    /* Field Of View ........*/ 90,
    /* Aspect Ratio .........*/ window.innerWidth / window.innerHeight,
    /* Frustrum Cull - Near .*/ 0.01,
    /* Frustrum Cull - Far ..*/ 500
  );

  // 3D Core
  public composer3D: EffectComposer;
  private _baseR: THREE.WebGLRenderer;
  public entities: { [key: string]: THREE.Mesh } = {};

  // Global Repository of Materials, Geometries, and Textures
  public repository3: Repository3D = {material: {}, geometry: {}, textures: []};

  // Initialize the renderer and cameras
  init(): void {
    // 2D Camera
    this.camera2 = this.cameras.main;
    this.camera2.centerOn(0, 0);
    this.camera2.transparent = true;

    // 3D Camera
    const bounds = document.body.getBoundingClientRect();
    console.debug(bounds, 1000 / 90);
    this.camera3.position.z = this.camera3.far - this.camera3.near;

    // The UI Screen that will apply ThreeJS Post-Processing behind the Phaser canvas
    const screenGeometry = new THREE.PlaneGeometry(bounds.width / bounds.height, 1);
    const screenTexture = new THREE.CanvasTexture(phaseCanvas);
    const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture, transparent: true });
    const UIScreen = new THREE.Mesh(screenGeometry, screenMaterial);

    UIScreen.position.z = this.camera3.position.z - 1;
    UIScreen.scale.set(2, 2, 0);
    this.repository3.textures.push(screenTexture);

    // Set up layer orders
    this.compLayer.add(UIScreen, this.mainLayer);

    // Base Renderer
    this._baseR = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
    this._baseR.setSize(window.screen.width, window.screen.height);
    // Wire-Up pre-update call loop & initialize the composer
    this.events.on('preupdate', () => this.compute());
    this.compose();
  }

  // Create the global entities 
  create(): void {

    // Global Geometries
    const WireCube = new THREE.BoxGeometry(32, 32, 32, 6, 6, 6);

    // Global Materials
    const WF_White = new THREE.MeshStandardMaterial({
      wireframe: true,
      transparent: true,
      emissive: 0x00F92C,
      emissiveIntensity: 6
    });

    // Create the default entities
    const DefaultCube = this.addEntity(WireCube, WF_White, 'DefaultCube');
    DefaultCube.position.z = this.camera3.position.z - 100;

    // Update the repos
    this.repository3.geometry['WireCube'] = WireCube;
    this.repository3.material['WF_White'] = WF_White;
  }

  // Setup the Post-Processing Composer that will be used for rendering each frame
  compose(): void {
    this.composer3D = new EffectComposer(this._baseR);
    const res = new THREE.Vector2(window.innerWidth, window.innerHeight);

    // Compose the effects
    const baseFrame = new RenderPass(this.compLayer, this.camera3);
    const retroFilm = new FilmPass(1.2, 0.3, window.screen.height, 0);
    const bloomGlow = new UnrealBloomPass(res, 0.63, 0.96, 0.001);
    const lineArt = new OutlinePass(res, this.compLayer, this.camera3, this.mainLayer.children);
    

    // Layer the effect application order
    this.composer3D.addPass(baseFrame);
    this.composer3D.addPass(lineArt);
    this.composer3D.addPass(bloomGlow);
    this.composer3D.addPass(retroFilm);

    /* uncomment for an extra level of anti-aliasing */
    //this.composer3D.addPass(FXAA); 
  }

  compute(): void {
    this.repository3.textures.forEach(texture => texture.needsUpdate = true);  

    // Entity Transforms
    this.entities.DefaultCube.rotation.y += 0.01;
  }

  update(): void {
    !this.scene.isPaused('AiDA') && this.composer3D.render();
    this.scene.isPaused('AiDA') && this.scene.stop('ThreeOrchestrator')
    // this.scene.isPaused('AiDA') && this.composer3D.dispose();
  }

  // Externally called to add new meshes built from the repository3 assets
  public addEntity(g: THREE.BufferGeometry, m: THREE.Material, name: string): THREE.Mesh {
    this.entities[name] = new THREE.Mesh(g, m);
    this.mainLayer.add(this.entities[name]);
    return this.entities[name];
  }
}