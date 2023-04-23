import * as THREE from "three";
import { phaseCanvas, threeCanvas } from "../..";

// TODO: Move this to a dedicated post-processing class
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

// Loaders
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import InputHandler from './InputHandler';
import AiDA from '../TiLLI';
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass';

// Overlay for ThreeJS and the UI
export default class VisualDisplay extends Phaser.Scene {
  constructor() { super('VisualDisplay') }

  // Globals
  public scene3: THREE.Scene;
  public camera3: THREE.OrthographicCamera;
  public renderer3: THREE.WebGLRenderer;
  public graphics2: Phaser.GameObjects.Graphics;

  // Props
  private aspectRatio: number;
  private phaser: THREE.CanvasTexture;
  private quadMesh: THREE.Mesh;
  private effectComposer: EffectComposer;

  // Meshes & Prefab Models
  private cursor3: THREE.Mesh;

  init(): void {
    this.cameras.main.centerOn(0, 0);

    // Don't initialize until fullscreen has been entered
    if (document.fullscreenEnabled && document.fullscreenElement === null) {
      
    // Create the 3D camera
    this.aspectRatio = window.innerWidth / window.innerHeight;
      this.camera3 = new THREE.OrthographicCamera(
        -window['cx'], window['cx'],
        -window['cy'], window['cy'],
        -100, 100
      );

    // Pass a 3D camera reference to AiDA main for synchronous zoom and panning
    this.scene.get('AiDA')['camera3'] = this.camera3;

    // Create the 3D scene
    this.scene3 = new THREE.Scene();

    // Create the 3D renderer
    this.renderer3 = new THREE.WebGLRenderer({ canvas: threeCanvas }) as THREE.WebGLRenderer;
    this.renderer3.setSize(window.innerWidth, window.innerHeight);
    this.renderer3.setClearAlpha(0);

    // Convert the PhaseUI to a texture projected onto a Plane
    let quad = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 1, 1);
    this.phaser = new THREE.CanvasTexture(phaseCanvas);

    // Instruct the renderer to update the texture data on each frame
    this.phaser.needsUpdate = true;

    // Create the transparent UI material
    const flatMat = new THREE.MeshBasicMaterial({
      map: this.phaser,
      transparent: true,
    });

    // The Plane mesh that the UI will be rendered to
    this.quadMesh = new THREE.Mesh(quad, flatMat);

    // The 3D cursor
    const cursor3_geom = new THREE.IcosahedronGeometry(36, 1);
      
    // Nearest ThreeJS approximation to Blender's Principled BSDF
    const defaultMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00ACFF,
      transparent: true,
      opacity: 0.09,
      emissive: 0xFFFFFF,
      emissiveIntensity: 1,
      transmission: 0x000000,
    });
      defaultMaterial.wireframe = true;
    this.cursor3 = new THREE.Mesh(cursor3_geom, defaultMaterial);

    // Set positions 
    //   this.cursor3.position.z = -22;
    // this.phasePlane.position.z = 1;
    this.quadMesh.rotation.x = Phaser.Math.DegToRad(180);      
    // Populate scene
    this.scene3.add(
      new THREE.AmbientLight(0xFFFFFF, 1),
      this.quadMesh,
      // this.cursor3
    );

    // TODO: Move this to the create block, but in a dedicated file
    // * Post-Processing - Base Render
      const renderPass = new RenderPass(this.scene3, this.camera3);
    
    // Diffuse Glow - Adds to visual stimuli and smooths out artifacts caused by FXAA filter
    const ueBloomPass = new UnrealBloomPass(
      new THREE.Vector2(),
      0.42,
      0.03,
      0
    );

    // After Image - Creates a ghosting effect to help visually track movement
    const afterImage = new AfterimagePass(0.3);

    // VHS Effect - Creates novel visual stimuli to help focus attention
    const vhs = new FilmPass(1, 0.6, 4096, 0);

    // Anti-Aliasing
    const fxaa = new ShaderPass(FXAAShader);

    // Create the effect composer and add passes to it | NOTE: pass-ordering matters
    this.effectComposer = new EffectComposer(this.renderer3);
    this.effectComposer.setPixelRatio(window.devicePixelRatio);
    this.effectComposer.addPass(renderPass); // do first...
    this.effectComposer.addPass(afterImage);
    this.effectComposer.addPass(ueBloomPass);
    this.effectComposer.addPass(vhs);
    this.effectComposer.addPass(fxaa);
    }
  }
  
  create(): void {
    const AiDA = this.scene.get('AiDA') as AiDA;

    // @ts-ignore
    const dotRingRadius = ((this.scene.get('AiDA') as AiDA).indicatorBorder?.radius * 1.3) || 0;
    this.graphics2 = (
      this.add.graphics()
        .fillStyle(0x000000, 1)
        .lineStyle(0.6, 0xFFFFFF, 1)
        .strokeCircle(0, 0, dotRingRadius)
    );

    const dotRing = new Phaser.Geom.Circle(0, 0, dotRingRadius);
    dotRing.getPoints(3).forEach(dot => {
      this.graphics2
      .fillCircle(dot.x, dot.y, 6)
      .strokeCircle(dot.x, dot.y, 6)
    })

    // Protoglyph name display
    const nameDisplay = this.add.container(0, 0);

    const sensors = this.add.graphics();
    sensors.x -= 115;
    sensors.lineStyle(3, 0xACACAC, 0.3);
    sensors.strokeRoundedRect(0, 0, 21 + 34 + 34 + 34 + 34 + 21, 42, 18);

    // Sensor Icon Regions - Rough Draft
    sensors.fillStyle(0xFF0000, 0.06);
    sensors.lineStyle(3, 0xACACAC, 0.4);
    sensors.fillCircle(21, 21, 15);
    sensors.strokeCircle(21, 21, 15);
    sensors.fillCircle(21 + 34, 21, 15);
    sensors.strokeCircle(21 + 34, 21, 15);
    sensors.strokeCircle(21 + 34 + 34, 21, 15);
    sensors.strokeCircle(21 + 34 + 34 + 34, 21, 15);
    sensors.strokeCircle(21 + 34 + 34 + 34 + 34, 21, 15);
    this.add.text((window['cx']) - 220, -(window['cy']) + 34 + 6, '🎤 🧭  🧠 🔊 📳', {
      fontSize: '13pt',
      fontFamily: 'monospace',
      color: 'rgba(100, 100, 100, 0.3)',
      padding: {
        top: 3
      }
    });


    nameDisplay.add([
      sensors
    ]);

    AiDA.statusIndicator && nameDisplay.setPosition(
      +(window['cx'] - (144 * 0.78)),
      -(window['cy'] - 30)
    );

    const isMain = AiDA.MODE === 'MAIN';
    const mainPortalNode = this.add.container(0, 0);

    // Draft out the node rotary design
    // TODO: Figure out how to make the sizes of these proportional to display dimensions rather than pixel values
    const shadowViewer = this.add.circle(0, 0,
      ((window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) * 0.22) / 2
    ).setStrokeStyle(6, 0xFFFFFF, 1);

    const innerOrbital = this.add.circle(0, 0,
      ((window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) * 0.70) / 2,
      0xFFFFFF, 0).setStrokeStyle(3, 0xFFAC00, 1);
    
    const outerOrbital = this.add.circle(0, 0,
      ((window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) * 0.75) / 2
    ).setStrokeStyle(3, 0xFFAC00, 1);

    // Mode switch pips
    const line = this.add.line(0, 0, -30, 0, 30, 0, 0xFFFFFF, 1).setAngle(-90);
    const blackmask = this.add.circle(0, 30, 18, 0x000000, 1);
    this.add.circle(0, -window['cy'] + 32, 9).setStrokeStyle(2, 0xFFFFFF, 1);

    this.add.circle(-window['cx'] + 32, 0, 3, 0xFFFFFF, 1);
    this.add.circle(-window['cx'] + 32, 0, 9).setStrokeStyle(2, 0xFFFFFF, 1);

    this.add.circle(+window['cx'] - 32, 0, 3, 0xFFFFFF, 1);
    this.add.circle(+window['cx'] - 32, 0, 9).setStrokeStyle(2, 0xFFFFFF, 1);

    line.x = -window['cx'] + 32;
    line.y = 0 - 30;
    blackmask.setPosition(-window['cx'] + 32, 0);

    this.add.circle(0, +window['cy'] - 32, 3, 0xFFFFFF, 1);
    this.add.circle(0, +window['cy'] - 32, 9).setStrokeStyle(2, 0xFFFFFF, 1);

    const originalWidth = window.innerWidth;

    document.onfullscreenchange = () => { 
      if (document.fullscreenElement) {
        const aspect = window.screen.width / window.screen.height;

        this.game.scale.resize(window.screen.width, window.screen.height);
        this.renderer3.setSize(window.screen.width, window.screen.height);
        this.effectComposer.setSize(window.screen.width, window.screen.height);

        this.camera3.left = -(window.screen.width / 2) * aspect;
        this.camera3.right = (window.screen.height / 2) * aspect;

        this.camera3.updateProjectionMatrix();
      }
    };
  }

  update(): void {

  //   // Maintain Status Indicator alignment with status window centroid
    const AiDA = this.scene.get('AiDA') as AiDA;
    if (AiDA.statusIndicator) {
      this.cursor3.position.x = AiDA.statusIndicator.x;
      this.cursor3.position.y = AiDA.statusIndicator.y;
    }
    this.graphics2.setPosition(this.cursor3.position.x, this.cursor3.position.y);
    this.cursor3.rotation.y += 0.03;
    this.cursor3.rotation.x = Phaser.Math.DegToRad(45);
    this.graphics2.angle--;
    this.graphics2.setDepth(99);
    AiDA.MODE === 'MAIN' && (this.graphics2.scale = 2.45);
    this.cursor3.visible = AiDA.glyphcode === 0x00;

  //   // propagate latest image data from UI
    this.phaser.needsUpdate = true; 
    this.effectComposer.render();
  }
}