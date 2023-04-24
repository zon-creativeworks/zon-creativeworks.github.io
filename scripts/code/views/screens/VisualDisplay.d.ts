import * as THREE from "three";
export default class VisualDisplay extends Phaser.Scene {
    constructor();
    scene3: THREE.Scene;
    camera3: THREE.OrthographicCamera;
    renderer3: THREE.WebGLRenderer;
    graphics2: Phaser.GameObjects.Graphics;
    private aspectRatio;
    private phaser;
    private quadMesh;
    private effectComposer;
    private cursor3;
    init(): void;
    create(): void;
    update(): void;
}
