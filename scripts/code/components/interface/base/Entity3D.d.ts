import * as THREE from "three";
export default class Entity3D extends THREE.Mesh {
    name: string;
    tex: THREE.Texture;
    constructor(name: string, geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Texture, transparent?: boolean);
}
