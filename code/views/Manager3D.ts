import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
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

export default class Manager3D {
  public meshes: { [key: string]: THREE.Mesh } = {};
  private composer: EffectComposer;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene = new THREE.Scene();
  private target: HTMLCanvasElement = document.getElementById('three') as HTMLCanvasElement;
  private UI: THREE.CanvasTexture;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1e-4, 1e4);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.target, alpha: true, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;
    this.renderer.setClearColor(0x000000, 0.90);

    // Chain to Setup
    this.setup();
  }

  setup(): void {

    // Setup the UI Canvas Texture
    const phaserCanvas = document.getElementById('phase') as HTMLCanvasElement;
    this.UI = new THREE.CanvasTexture(phaserCanvas);
    this.UI.needsUpdate = true;

    const geo = new THREE.IcosahedronGeometry(1.6, 0);
    const flatWhite = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, reflectivity: 1.0 });
    const ico = new THREE.Mesh(geo, flatWhite);
    this.meshes['ico'] = ico;

    ico.position.set(0, 0, -10);
    this.scene.add(ico);
    this.camera.lookAt(ico.position);

    // Post-Processing and Shaders
    this.composer = new EffectComposer(this.renderer);
    const vec2res = new THREE.Vector2(window.innerWidth, window.innerHeight); /* for passes that require a vec2 resolution */

    const rootPass = new TAARenderPass(this.scene, this.camera, 0x9A5CBF, 0.36);
    const UI2DPass = new TexturePass(this.UI, 0.9);

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
    this.meshes['prism'] = prism;
    prism.position.set(0, 0, -100);

    // Main Lighting Rig
    const spotA = new THREE.SpotLight(0xFFFFFF, 90, 90, 180, 0, 12);
    spotA.position.set(0, 0, 60);

    const boxG = new THREE.BoxGeometry(10, 10, 10);
    const FlatBlack = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const cube = new THREE.Mesh(boxG, FlatBlack);
    cube.rotation.set(Phaser.Math.DegToRad(45), 0, 0);

    this.scene.add(
      prism, 
      cube,
      spotA,
      // new THREE.PointLight(0xFFFFFF, 1)
    );

    const lineArt = new OutlinePass(new THREE.Vector2(vec2res.x, vec2res.y), this.scene, this.camera, [prism]);
    lineArt.edgeThickness = 1;
    lineArt.edgeStrength = 16;
    lineArt.visibleEdgeColor = new THREE.Color(0, 0, 0);
    lineArt.hiddenEdgeColor = new THREE.Color(1, 1, 1);

    const FXAntiAlias = FXAA;
    FXAntiAlias.uniforms['resolution'] = new THREE.Uniform(new THREE.Vector2(vec2res.x, vec2res.y));
    console.debug(FXAntiAlias.uniforms)
    
    // TAA Base Pass
    this.composer.addPass(rootPass);
    this.composer.addPass(FXAntiAlias);
    
    // Initial FX
    this.composer.addPass(lineArt);
    this.composer.addPass(hazyGlow);

    // Final FX
    this.composer.addPass(UI2DPass);
    this.composer.addPass(retroCRT);
    this.composer.addPass(timeHaze);

    // Dynamic FX
    this.composer.addPass(transGlitch);

    // this.add.circle(0, 0, 60, 0x000000);

    // periodically reset the internal clock for the retroCRT shader to mitigating banding;
    setInterval(() => {
      retroCRT.uniforms['time'] = new THREE.Uniform(0);
    }, 30000);

    this.renderer.compile(this.scene, this.camera);

    // Chain to Animate
    this.animate();
  }

  update(): void {
    this.UI.needsUpdate = true;
    this.meshes['ico'].rotation.y += 0.1;
    this.meshes['prism'].rotation.y += 0.01;
  }

  animate(): void {
    const doRender = () => {
      requestAnimationFrame(doRender);
      this.update();
      this.composer.render();
      // this.renderer.render(this.scene, this.camera); // Last
    };
    doRender();
  }
}