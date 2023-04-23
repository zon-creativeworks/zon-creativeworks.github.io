import * as THREE from "three";

// Wrapper for managing the common aspects of building 3D entities (geometry, material, texture, etc.)
export default class Entity3D extends THREE.Mesh {
  public name: string;
  public tex: THREE.Texture;

  constructor(name: string, geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Texture, transparent?: boolean) {

    // Assign this entity's material; if the mat value is a texture, map it to a Basic Material
    const material = (mat.type === THREE.UnsignedByteType) ? new THREE.MeshBasicMaterial({
      map: mat, 
      transparent: transparent || false
    }) : mat;

    // Build this mesh from the supplied params
    super(geo, material);

    // Assign the name for this entity
    this.name = name;

    // If mat is a texture, ensure it is updated
    if (mat.type === THREE.UnsignedByteType) this.tex = mat;
    return this;
  }
}