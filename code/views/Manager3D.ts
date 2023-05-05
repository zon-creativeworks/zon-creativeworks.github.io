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
  public animationGroups: { [key: string] : THREE.Group } = {};

  private scene: THREE.Scene;
  private composer: EffectComposer;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private target: HTMLCanvasElement = document.getElementById('three') as HTMLCanvasElement;

  private textures: THREE.CanvasTexture[] = [];
  public addTexture(t: THREE.CanvasTexture): void {
    this.textures.push(t);
    this.renderer.resetState();
    this.setup();
  }

  constructor() {
    // this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1e-4, 1e4);
    this.camera = new THREE.OrthographicCamera(
      -(window.innerWidth / 2) * 0.02,
      +(window.innerWidth / 2) * 0.02,
      +(window.innerHeight / 2) * 0.02,
      -(window.innerHeight / 2) * 0.02,
      -100,
      1000
    );

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

      // Orient scene composition to the camera
      meshData.scene.position.set(0, 0, 0);
      meshData.scene.rotation.set(THREE.MathUtils.degToRad(90), 0, 0);

      // Extract out child meshes to animate
      meshData.scene.children.forEach(mesh => {
        this.meshes[mesh.name] = mesh as THREE.Mesh;
        console.debug(mesh.name);
      });

      // Combine the composition with the main scene
      this.scene.add(meshData.scene);

      // Setup post-processing and shaders
      this.composer = new EffectComposer(this.renderer);
      const vec2res = new THREE.Vector2(window.innerWidth, window.innerHeight); /* for passes that require a vec2 resolution */
      const rootPass = new TAARenderPass(this.scene, this.camera, 0x8E29DF, 0.3);

      // Aesthetic FX
      const retroCRT = new FilmPass(0.36, 0.12, 1024, 0);
      const hazyGlow = new UnrealBloomPass(vec2res, 0.16, 3, 0.3);

      // Glitch effect to be triggered during scene transitions
      const transGlitch = new GlitchPass(-1);
      transGlitch.randX = 0.001;
      transGlitch.curF = 0.00001;
      transGlitch.enabled = false;

      const lineArt = new OutlinePass(new THREE.Vector2(vec2res.x, vec2res.y), this.scene, this.camera, [meshData.scene]);
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

      this.renderer.compile(this.scene, this.camera);

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

      // Chain to Animate
      this.animate();
    });
  }

  private update(): void {
    this.camera.updateProjectionMatrix();

    // --- Sensor and Interaction Synchronization ---
    // acceleration X <==> device motion alpha
    this.meshes['TorsionIndicator'].rotation.y += 0.01;
    this.meshes['AccelerationX'].rotation.z -= 0.1;
    this.meshes['AccelerationY'].rotation.x += 0.1;
    this.meshes['VerticalAcceleration'].rotation.x += 0.1;

    this.meshes['RotationIndicator'].rotation.y += 0.1;
    this.meshes['SouthPole'].rotation.z = this.meshes['RotationIndicator'].rotation.y;
    this.meshes['NorthPole'].rotation.z = this.meshes['RotationIndicator'].rotation.y;
    this.meshes['OrientationX'].rotation.x += 0.01;
    this.meshes['OrientationY'].rotation.y += 0.01;
    this.meshes['OrientationZ'].rotation.y -= 0.01; // Because local axes

    // this.camera.rotation.x += (this.camera.rotation.x < THREE.MathUtils.degToRad(90)) ? 0.01 : 0.0;
    this.camera.position.z += (this.camera.rotation.x >= THREE.MathUtils.degToRad(90) && this.camera.position.z < 6) ? 0.1 : 0.0;

    // Whole animation groups can be selected - note: they should all share a common origin point
    this.animationGroups['ControllerRail'].children.forEach(mesh => {
      mesh.rotation.y -= 0.01;
    });
  }

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