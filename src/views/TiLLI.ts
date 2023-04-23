import { 
  threeCanvas, 
  phaseCanvas 
} from '../index';
import InputHandler from './screens/InputHandler';
import VisualDisplay from './screens/VisualDisplay';
import SubstrateGrid from './screens/SubstrateGrid';


// Interface Alignment Layers & Config Presets
export const UI_Layers = {};


export default class TiLLI extends Phaser.Scene {
  constructor() { super('TiLLI') }

  // Layer Refs - Fetch each of this as children of the AiDA ref on window
  public InputHandler: InputHandler;
  public VisualDisplay: VisualDisplay;
  public SubstrateGrid: SubstrateGrid;
  
  // Global App Props
  public MODE: string = 'CONSOLE';
  public camera2: Phaser.Cameras.Scene2D.Camera;

  // Status Window Props
  public glyphcode: number = 0x00;
  public statusIndicator?: Phaser.GameObjects.Container;
  public indicatorWindow?: Phaser.GameObjects.Arc;
  public indicatorBorder?: Phaser.GameObjects.Arc;
  private status: Phaser.GameObjects.Text;
  

  public init(): void {
    // Configure the 2D UI Camera
    this.camera2 = this.cameras.main;
    this.camera2.centerOn(0, 0);
    this.camera2.transparent = true;
  }

  public create(): void {
    console.debug('TiLLI: Online 🌐');
    this.border = this.add.graphics();

    this.scene.launch('ThreeOrchestrator');
  }

  // App Area Border
  private border: Phaser.GameObjects.Graphics;
  private borderPadding = 24;

  public update(): void {
    // Set the status indicator position based on mode
    this.MODE === 'MAIN' && this.statusIndicator?.setPosition(0, 0);
  };
}

/* --- ▼ Custom Classes and Type Definitions ▼ --- */
// Single line pre-formatted text with configurable colors and values to diarize individual speakers
export class DialogLine extends Phaser.GameObjects.Text {

  // The rate at which the print method outputs each character
  private printSpeed: number = 60;
  public setPrintSpeed(speed: number): this { this.printSpeed = speed; return this; };

  // The actual text content to print out
  private lineContent: string = '';

  constructor(s: Phaser.Scene, val?: string, colorConfig?: {fill?: string, stroke?: string }) {
    super(s, 0, 0, '', {
      align: 'left',
      fontSize: '12pt',
      color: 'rgba(256, 200, 0, 1.0)',
      stroke: 'rgba(255, 255, 255, 0.03)',
      strokeThickness: 6,
      wordWrap: { width: window.innerWidth - 120 },
      padding: {
        top: 3,
        left: 6,
        right: 6,
        bottom: 3,
      }
    });

    // Modify the prototype set method
    // Stage val text for printing if it has been defined already
    val && (this.lineContent = val);
    s.add.existing(this);
  }

  // Typewriter-style animated text output
  public print(
    // Callback that is executed at the start of the print animation
    onStart?: () => void,

    // Callback that is executed at the end of the print animation
    onEnd?: () => void,

    // Callback that is executed each time a character is printed during the print animation
    onChar?: (char: string) => void
  ): void {
    // Start printing
    onStart && onStart();

    // Print the characters
    this.lineContent.split('').forEach((char, charNum) => { 
      setTimeout(() => {
        this.text += char;
        onChar && onChar(char);

        // Execute onEnd method on the last character
        if (charNum === this.lineContent.length - 1 && onEnd) onEnd();
      }, this.printSpeed * charNum);
    });
  }
}

// The main Holoform that users interact with AiDA through
export class PortalNode extends Phaser.GameObjects.Container { }

// A Hub Node that can connect multiple clients together
export class BranchNode extends Phaser.GameObjects.Container { }
