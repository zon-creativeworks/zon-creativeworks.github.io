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
} from '../components/controller/PostProcessing';


export default class Manager3D {
  public meshes: { [key: string]: THREE.Mesh } = {};
  private composer: EffectComposer;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private scene: THREE.Scene;
  private target: HTMLCanvasElement = document.getElementById('three') as HTMLCanvasElement;

  private textures: THREE.CanvasTexture[] = [];
  public addTexture(t: THREE.CanvasTexture): void {
    this.textures.push(t);
    this.renderer.resetState();
    this.setup();
  }

  constructor() {
    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1e-4, 1e4);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.target, alpha: false, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Chain to Setup
    this.setup();
  }

  private setup(): void {
    this.scene = new THREE.Scene();
    
    // Load mesh data & setup rendering pipeline
    const loader = new GLTFLoader();
    loader.load('code/assets/models/MandorlaUI.gltf', (meshData) => {
      console.debug(meshData);

      // Extract scene objects
      meshData.scene.position.set(0, 0, 0);
      meshData.scene.rotation.set(THREE.MathUtils.degToRad(90), 0, 0);
      meshData.scene.scale.set(100, 100, 100);

      // Extract out each sub-object
      meshData.scene.children.filter(entity => { return entity.type === 'Object3D'}).forEach(object3D => {
        console.debug(object3D.children);
      });
      this.scene.add(meshData.scene);

      // Extract Cameras and Lighting
      this.camera = meshData.cameras[0] as THREE.OrthographicCamera;
      this.camera.left = -(window.innerWidth / 2) * 0.02;
      this.camera.right = +(window.innerWidth / 2) * 0.02;
      this.camera.top = +(window.innerHeight / 2) * 0.02;
      this.camera.bottom = -(window.innerHeight / 2) * 0.02;
      this.camera.near = 0.01;
      this.camera.far = 100;

      // Adjust for the slight off-centeredness
      this.camera.position.set(0.1, 0, 0);

      // Setup post-processing and shaders
      this.composer = new EffectComposer(this.renderer);
      const vec2res = new THREE.Vector2(window.innerWidth, window.innerHeight); /* for passes that require a vec2 resolution */

    const rootPass = new TAARenderPass(this.scene, this.camera, 0xFEBC6C, 0.45);

    // Bloom & Glow FX
    const hazyGlow = new UnrealBloomPass(vec2res, 0.36, 0.09, 0.09);

    // Aesthetic FX
    const retroCRT = new FilmPass(0.36, 0.12, 1024, 0);
    const timeHaze = new AfterimagePass(0.36);

    // Glitch effect to be triggered during scene transitions
    const transGlitch = new GlitchPass(-1);
    transGlitch.randX = 0.001;
    transGlitch.curF = 0.00001;
    transGlitch.enabled = false;

    const lineArt = new OutlinePass(new THREE.Vector2(vec2res.x, vec2res.y), this.scene, this.camera, [meshData.scene]);
    lineArt.edgeThickness = 2;
    lineArt.edgeStrength = 2;
    lineArt.visibleEdgeColor = new THREE.Color(1, 1, 1);
    lineArt.hiddenEdgeColor = new THREE.Color(1, 1, 1);

    const resolution: THREE.Vector2 = new THREE.Vector2(0.0001, 0.0001);
    const FXAntiAlias = FXAA;
    FXAntiAlias.setSize(window.innerWidth, window.innerHeight);
    FXAntiAlias.uniforms['resolution'] = new THREE.Uniform(resolution);
    
    // TAA Base Pass
    this.composer.addPass(rootPass);
    this.composer.addPass(FXAntiAlias);
    
    // Initial FX
    this.textures.forEach(texture => {
      const texturePass = new TexturePass(texture, 0.9);
      this.composer.addPass(texturePass);
    });
    this.composer.addPass(lineArt);
    this.composer.addPass(hazyGlow);

    // Final FX
    this.composer.addPass(retroCRT);
    this.composer.addPass(timeHaze);

    // Dynamic FX
    this.composer.addPass(transGlitch);

    // periodically reset the internal clock for the retroCRT shader to mitigating banding;
    setInterval(() => {
      retroCRT.uniforms['time'] = new THREE.Uniform(0);
    }, 30000);

    this.renderer.compile(this.scene, this.camera);

    // Chain to Animate
    this.animate();
    });

  }

  private update(): void {this.camera.updateProjectionMatrix()}

  private animate(): void {
    const doRender = () => {
      requestAnimationFrame(doRender);
      this.update();
      this.camera.updateProjectionMatrix();
      this.camera.updateWorldMatrix(true, true);
      this.composer.render();
    };
    doRender();
  }
}