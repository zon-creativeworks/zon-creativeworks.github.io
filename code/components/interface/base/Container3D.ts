import * as THREE from "three";
import { ColorifyShader } from 'three/examples/jsm/shaders/ColorifyShader';


// Behaves like a normal Phaser 3 Container as well as THREE.Group, but returns a canvas texture that can be used in a texture pass
export default class Container3D extends Phaser.GameObjects.Container {
  constructor(dx: number, dy: number, pScene: Phaser.Scene) {
    super(pScene, dx, dy);

    this.group3 = new THREE.Group();
    this.build2D();
    this.build3D();
    this.addToUpdateList();
    this.addToDisplayList();
  }

  // Props
  private scene3: THREE.Scene;
  private group3: THREE.Group; // acts as a 3D paralog to the 2D Phaser container

  // Methods
  public build2D(): void {
    const circle = this.scene.add.circle(0, 0, 30, 0xFFFFFF);
    this.add(circle);
  }

  public build3D(): void {

    const geometry = new THREE.IcosahedronGeometry(3, 0);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, transparent: true, opacity: 1.0 });
    const testMesh = new THREE.Mesh(geometry, material);

    this.group3.add(testMesh);
  }
  public preUpdate(time: number, delta: number): void { this.perFrame(time, delta) };

  // Syncs Three.js composer rendering with Phaser 3's pre-update loop
  private perFrame(t: number, d: number): void {
    this.group3.children[0].rotation.y += 0.1;
  }
}