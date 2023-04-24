import * as THREE from 'three';

/* Extracts all post-processing FX from deeply-nested and isolated directories */
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'

// pre-set passes
import { AfterimagePass      } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { BloomPass           } from 'three/examples/jsm/postprocessing/BloomPass';
import { BokehPass           } from 'three/examples/jsm/postprocessing/BokehPass';
import { DotScreenPass       } from 'three/examples/jsm/postprocessing/DotScreenPass';
import { FilmPass            } from 'three/examples/jsm/postprocessing/FilmPass';
import { GlitchPass          } from 'three/examples/jsm/postprocessing/GlitchPass';
import { HalftonePass        } from 'three/examples/jsm/postprocessing/HalftonePass';
import { MaskPass            } from 'three/examples/jsm/postprocessing/MaskPass';
import { OutlinePass         } from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass';
import { SAOPass             } from 'three/examples/jsm/postprocessing/SAOPass';
import { SMAAPass            } from 'three/examples/jsm/postprocessing/SMAAPass';
import { SSRPass             } from 'three/examples/jsm/postprocessing/SSRPass';
import { UnrealBloomPass     } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { TexturePass         } from 'three/examples/jsm/postprocessing/TexturePass';
import { SavePass            } from 'three/examples/jsm/postprocessing/SavePass';
import { ClearPass           } from 'three/examples/jsm/postprocessing/ClearPass';
import { TAARenderPass       } from 'three/examples/jsm/postprocessing/TAARenderPass';

// Color Tuning
import { LUTPass                 } from 'three/examples/jsm/postprocessing/LUTPass';
import { AdaptiveToneMappingPass } from 'three/examples/jsm/postprocessing/AdaptiveToneMappingPass';

// For passes that use a shader e.g. FFXA
import { ShaderPass             } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader             } from 'three/examples/jsm/shaders/FXAAShader';
import { TriangleBlurShader     } from 'three/examples/jsm/shaders/TriangleBlurShader';
import { DepthLimitedBlurShader } from 'three/examples/jsm/shaders/DepthLimitedBlurShader';
import { ColorifyShader         } from 'three/examples/jsm/shaders/ColorifyShader';

const FXAA = new ShaderPass(FXAAShader);
const TriangleBlur = new ShaderPass(TriangleBlurShader);
const DepthLimBlur = new ShaderPass(DepthLimitedBlurShader);
const Redshift = new ShaderPass(ColorifyShader);
Redshift.uniforms[ 'color' ] = new THREE.Uniform(new THREE.Color(255, 0, 0));

// Other FX Addons
import { OutlineEffect  } from 'three/examples/jsm/effects/OutlineEffect';
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect';
import { HTMLMesh       } from 'three/examples/jsm/interactive/HTMLMesh';

// Offscreen
import * as sc3 from 'three/examples/jsm/offscreen/scene';
import * as os3 from 'three/examples/jsm/offscreen/offscreen';

// Computational
// import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes';

// Make them all available
export {
  // Required
  EffectComposer,
  RenderPass,

  // Pre-Sets
  AfterimagePass,
  BloomPass,
  BokehPass,
  DotScreenPass,
  FilmPass,
  GlitchPass,
  HalftonePass,
  LUTPass,
  MaskPass,
  OutlinePass,
  RenderPixelatedPass,
  SAOPass,
  SMAAPass,
  SSRPass,
  UnrealBloomPass,
  TexturePass,
  SavePass,
  ClearPass,
  TAARenderPass,
  AdaptiveToneMappingPass,

  // Shader-Based
  FXAA,
  TriangleBlur,
  DepthLimBlur,
  Redshift,

  // Effects
  OutlineEffect,
  AnaglyphEffect,
  HTMLMesh,

  // Offscreen
  sc3,
  os3,

  // Computational
  // MarchingCubes
}