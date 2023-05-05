import * as THREE from "three";
import Holoform from "../base/Holoform";


// Used only for setting up Holoform functions; should not be used in production
export default class DevHoloform extends Holoform {
  override build(): void {

    // Flavor Text | Label
    const label = this.scene.add.text(0, 0, 'DEVELOPMENT HOLOFORM', {
      fontSize: '12pt',
      align: 'center'
    }).setOrigin();

    // Visual 2D Form
    const visual2D = this.scene.add.circle(0, 30, 12, 0x000000, 1).setStrokeStyle(3, 0xFF00FF);

    const visual3D = new THREE.Group();
    const visualGeometry = new THREE.IcosahedronGeometry(2, 0);
    const visualMaterial = new THREE.MeshBasicMaterial({ color: 0xFF00FF, wireframe: true });
    const visualMesh = new THREE.Mesh(visualGeometry, visualMaterial);
    visual3D.add(visualMesh);

    // Marshall all 2D and 3D elements into the active MMV
    this.add([label, visual2D]);
    this.parent.scene3.add(visual3D);
  }
  override animate(): void {}
}