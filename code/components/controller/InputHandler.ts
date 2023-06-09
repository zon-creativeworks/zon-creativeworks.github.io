import Phaser from 'phaser';


// Manages user input and navigation
export default class InputHandler extends Phaser.Scene {
  constructor() { super('InputHandler') }

  public init(): void {
    this.cameras.main.centerOn(0, 0);
  }

  // Add cursor event handling
  public create(): void {
    // Physics paralogue for cursor
    this.matter.add.pointerConstraint();
    this.game.cache.physics.add('matter', this.matter);

    // * Zoom Control
    this.input.addListener('wheel', (wheel: Phaser.Input.Pointer) => {
      const zoomDelta = wheel.deltaY;

      // If delta is negative, emit a zoom-in event
      zoomDelta < 0 && this.game.events.emit('zoom-in');

      // If delta is positive, emit a zoom-out event
      zoomDelta > 0 && this.game.events.emit('zoom-out');
    });

    // * Grid Panning Control
    // Grid Panning is performed either by tethered cursor or by keyed input
    // ~Single-Tap + drag for grid panning

    // Double-Tap + hold for PTT in any mode
    // Convert top left display plate to show active and inactive sensor state icons

    // Press + Hold on Status Window to open menu
    // Dragging upward moves between the menu options when window is docked
    // Dragging in circle does the same when window is centered on a node

    const upClick = (at: { x: Number, y: number }) => { this.game.events.emit('upclick', at) };
    const dnClick = (at: { x: Number, y: number }) => { this.game.events.emit('dnclick', at) };

    
    // * Click Input
    this.input.addListener('pointerup', (pointer: Phaser.Input.Pointer) => {
      console.debug('Mouse Down Released');
      upClick({ x: pointer.worldX, y: pointer.worldY });
    });
    this.input.addListener('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.debug('Mouse Down Captured');
      dnClick({ x: pointer.worldX, y: pointer.worldY });
    });

    // * Touch Input
    this.input.addListener('touchstart', (tStart: Phaser.Input.Pointer) => { 
      dnClick({ x: tStart.worldX, y: tStart.worldY });
    });
    this.input.addListener('touchmove', (tDrag: Phaser.Input.Pointer) => { 
      console.debug(`Touch Drag:`, tDrag);
    });
    this.input.addListener('touchend', (tEnd: Phaser.Input.Pointer) => {
      upClick({ x: tEnd.worldX, y: tEnd.worldY });
    });

    let keyStatus;
    // Add virtual onscreen keyboard that can be display by double-tapping, or hitting tab from a physical one
    this.input.keyboard.on('keydown', (down: KeyboardEvent) => { 
      // down.preventDefault();

      // Set a delay for the active status
      clearTimeout(keyStatus);
      keyStatus = setTimeout(() => {
        this.game.events.emit('status', '');
      }, 800);
      this.game.events.emit('status', 'Typing');
      console.debug(`Key Pressed: `, down.key);

      // When tab is pressed, activate keypad
      if (down.key === 'Tab') {
        console.debug('Keypad active');
      }
    });
  }
}