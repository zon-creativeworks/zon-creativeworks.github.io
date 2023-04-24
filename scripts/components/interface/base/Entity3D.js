"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
class Entity3D extends THREE.Mesh {
    constructor(name, geo, mat, transparent) {
        const material = (mat.type === THREE.UnsignedByteType) ? new THREE.MeshBasicMaterial({
            map: mat,
            transparent: transparent || false
        }) : mat;
        super(geo, material);
        this.name = name;
        if (mat.type === THREE.UnsignedByteType)
            this.tex = mat;
        return this;
    }
}
exports.default = Entity3D;
//# sourceMappingURL=Entity3D.js.map