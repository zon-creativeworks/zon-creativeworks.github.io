import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { threeCanvas, phaseCanvas, bezel } from '../../index';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import { AdaptiveToneMappingPass, AfterimagePass, FilmPass, GlitchPass, OutlinePass, UnrealBloomPass } from '../manager/PostProcessing';
import * as Tone from 'tone';
import SubstrateGrid from '../../views/screens/SubstrateGrid';
import TilliBot_Avatar from '../images/TilliBot_Avatar';
import Avatar from './base/Avatar';
import TapeHead from '../../modules/programs/TapeHead';
import Tapehead_Avatar from '../images/Tapehead_Avatar';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';


export default class MainInterface extends Phaser.Scene {

  // Main User Interaction Devices
  public invokerDisc: Phaser.GameObjects.Container;
  public invokerRoot: {x: number, y: number};
  public interactron: Phaser.GameObjects.Container;

  // Props - ThreeJS
  private camera3D: THREE.OrthographicCamera;
  private rootScene = new THREE.Scene();
  private rootRenderer: THREE.WebGLRenderer;
  private phaseTexture: THREE.CanvasTexture;

  // 2D Objects - used to apply geometry masks globally
  public obj2D: Phaser.GameObjects.GameObject[] = [];

  // 3D Objects - used to apply alpha maps and per-object render passes
  public obj3D: THREE.Mesh[] = [];

  // Independent Orbitals
  private independentOrbitals: Phaser.GameObjects.Group;

  // Props - Phaser3
  private camera2D: Phaser.Cameras.Scene2D.Camera;
  public menuSlotNodes: Phaser.GameObjects.Container;

  // Mode Management - Controls which program runs in the IRIS when it is activated
  public modeName: string = 'MAIN';
  public activeAvatar: Avatar;
  public contextDock: Phaser.GameObjects.Arc;
  public textInterfaceToggle: Phaser.GameObjects.Container;
  private programLabel: Phaser.GameObjects.Text;

  // State Trackers
  public menuActive: boolean = false; // Radial Menu
  public IRISActive: boolean = false; // IRIS Interface
  public termActive: boolean = false; // Terminal Interface
  private mandorlaMode: boolean = true;
  private stateIndicator: Phaser.GameObjects.Arc;
  private onDoubleTap: () => void;

  // Props - Globals
  public res: {w: number, h: number}
  public isMobile: boolean;
  public nearField: number = 0.1e-3;
  public distField: number = 10.0e3;
  public aspectRatio: number;
  public fieldOfView: number = 60;
  public isQuietTime: boolean = false;

  // Pointer Tracking
  public cursor: {x: number, y: number} = { x: 0, y:0 };
  public getCursor(): {x: number, y: number} { return this.cursor };

  // Interactive Element - Callback Boilerplate
  public handleInteraction(area: Phaser.Geom.Circle, handlers: { 
    onHover?: (cPos: {x: number, y: number}) => void, 
    onClick?: (cPos: {x: number, y: number}) => void, 
    onTouch?: (cPos: {x: number, y: number}) => void
  }): void {
    const isHover = area.contains(this.cursor.x, this.cursor.y);
    const isClick = isHover && this.input.activePointer.isDown;
    const isTouch = this.input.mousePointer.wasTouch;
      if (isHover && handlers.onHover) handlers.onHover(this.getCursor());
      else
      if ((isClick || isTouch) && handlers.onClick) handlers.onClick(this.getCursor());
      else
      if (isTouch && handlers.onTouch) handlers.onTouch(this.getCursor());
  }

  constructor() {
    super('MainInterface');

    // Ensure canvas sizes are correct
    phaseCanvas.width = window.innerWidth;
    phaseCanvas.height = window.innerHeight;
    threeCanvas.width = window.innerWidth;
    threeCanvas.height = window.innerHeight;

    this.res = {
      w: window.innerWidth, 
      h: window.innerHeight,
    };
    this.aspectRatio = this.res.w / this.res.h;

    // The main renderer that will be used for compositing and applying FX
    this.rootRenderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true, 
      canvas: threeCanvas, 
    });
    this.rootRenderer.setSize(this.res.w, this.res.h);
    this.rootRenderer.setPixelRatio(window.devicePixelRatio);

    // The 2D texture from the Phaser Canvas that will be rendered into the final composition
    this.phaseTexture = new THREE.CanvasTexture(phaseCanvas);
  }

  preload(): void {

    // Avatar Base Vectors
    this.load.svg('TiLLI', 'assets/icons/TiLLI.svg', {scale: 0.55});
    this.load.svg('Tapehead-Base', 'assets/icons/TapeHead_NoSpoke.svg', {scale: 0.55});
    this.load.svg('Tapehead-SpokeEye', 'assets/icons/TapeHead_SpokeOnly.svg', {scale: 0.55});

    // Mode Icons
    this.load.svg('eben', 'assets/icons/modes/eben.svg', {scale: 0.12});
    this.load.svg('wandry', 'assets/icons/modes/wandry.svg', {scale: 0.2})
    this.load.svg('tapehead', 'assets/icons/modes/tapehead.svg', {scale: 0.12});
    this.load.svg('tillibot', 'assets/icons/modes/tillibot.svg', {scale: 0.12});
    this.load.svg('robohobb', 'assets/icons/modes/robohobb.svg', {scale: 0.12});

    // Sensors & Permissions Icons
    this.load.svg('gyro', 'assets/icons/sensors/gyro.svg', {scale: 0.16});
    this.load.svg('settings', 'assets/icons/settings.svg', {scale: 0.06});
    this.load.svg('transcript', 'assets/icons/transcript.svg', {scale: 0.06});
  }

  init(): void {

    // Bezel Glow - Doesn't ever need to be messed with
    this.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF, alpha: 0.32 }})
    .strokeRect(
      -this.res.w / 2, -this.res.h / 2, 
      window.innerWidth, window.innerHeight
    );

    // Maintain a constant cursor position by world offset
    this.events.on('preupdate', () => this.cursor = {x: this.input.activePointer.worldX, y: this.input.activePointer.worldY});
    
    // The camera used to render items from orthographic "flatland" sprites into perspective 3D
    this.camera3D = new THREE.OrthographicCamera(
      -this.res.w /2, +this.res.w /2,
      -this.res.h / 2, +this.res.h / 2,
      0.001, 10000
    );

    // Terminal Interface Toggle
    const iconSize = 26;
    const edgeRadius = 6;
    const maxWidth = window.innerWidth - (iconSize * 1.5);

    this.textInterfaceToggle = this.add.container(0, 0);

    // not sure why this works for all viewport shapes, but it does - no touchy!
    this.textInterfaceToggle.setPosition(
      -(window.innerWidth / 2) + (iconSize * 1.5),
      +(window.innerHeight / 2) - (iconSize * 1.5)
    ).setAlpha(0.64);

    let tiOutlineShape = new Phaser.Geom.Rectangle(
      -iconSize / 2, -iconSize / 2, 
      iconSize, iconSize
    );
    const rootOutlineShape = new Phaser.Geom.Rectangle(
      tiOutlineShape.x, tiOutlineShape.y,
      iconSize, iconSize
    );
    
    const pipTL = new Phaser.Math.Vector2(-(iconSize / 2) + 9, -(iconSize / 2) + 9);
    const pipTR = new Phaser.Math.Vector2(-(iconSize / 2) + 9, +(iconSize / 2) - 9);
    const pipBL = new Phaser.Math.Vector2(+(iconSize / 2) - 9, -(iconSize / 2) + 9);
    const pipBR = new Phaser.Math.Vector2(+(iconSize / 2) - 9, +(iconSize / 2) - 9);

    const pxInset = 26;
    const maxCornerTL = new Phaser.Math.Vector2(-(this.res.w / 2) + pxInset, -(this.res.h / 2) + pxInset);
    const maxCornerTR = new Phaser.Math.Vector2(+(this.res.w / 2) - pxInset, -(this.res.h / 2) + pxInset);
    const maxCornerBL = new Phaser.Math.Vector2(-(this.res.w / 2) + pxInset, +(this.res.h / 2) - pxInset);
    const maxCornerBR = new Phaser.Math.Vector2(+(this.res.w / 2) - pxInset, +(this.res.h / 2) - pxInset);

    // Text Interface Toggle - Icon Pips
    const ti_TopLeft = this.add.circle(pipTL.x, pipTL.y, 4, 0xFFFFFF, 1).setDepth(2);
    const ti_TopRght = this.add.circle(pipTR.x, pipTR.y, 4, 0xFFFFFF, 1); 
    const ti_BotLeft = this.add.circle(pipBL.x, pipBL.y, 4, 0xFFFFFF, 1);
    const ti_BotRght = this.add.circle(pipBR.x, pipBR.y, 4, 0xFFFFFF, 1);

    const tiCornerPips = this.add.group([
      ti_TopLeft,
      ti_TopRght,
      ti_BotLeft,
      ti_BotRght
    ]);
    tiCornerPips.setDepth(2);

    this.textInterfaceToggle.add(tiCornerPips.getChildren());
    
        // Text Interface SFX
    const open = new Tone.Player('assets/audio/terminalOpen.wav').toDestination();
    const shut = new Tone.Player('assets/audio/terminalClose.wav').toDestination();

    let expandOutline = this.add.tween({
      targets: tiOutlineShape,
      duration: 300,
      width: window.innerWidth - (iconSize * 1.5),
      height: window.innerHeight - (iconSize * 1.5),
      x: -(window.innerWidth - (iconSize * 1.5)) / 2,
      y: -(window.innerHeight - (iconSize * 1.5)) / 2,
      paused: true,

      onComplete: () => {
        this.termActive = true;
      }
    });
    let centerShift = this.add.tween({
      targets: this.textInterfaceToggle,
      duration: 300,
      x: 0,
      y: 0, 
      paused: true,

      onActive: () => {
        open.start();

        // Hide Elements
        this.interactron.setAlpha(0);
        this.invokerDisc.setAlpha(0);
      },
      onComplete: () => expandOutline.play()
    });

    let closeOutline = this.add.tween({
      targets: tiOutlineShape,
      duration: 300,
      width: rootOutlineShape.width,
      height: rootOutlineShape.height,
      x: rootOutlineShape.x,
      y: rootOutlineShape.y,
      paused: true,

      onActive: () => {shut.start(); this.termActive = false},
      onComplete: () => reset.play()
    });
    let reset = this.add.tween({
      targets: this.textInterfaceToggle,
      duration: 300,
      x: this.textInterfaceToggle.x, 
      y: this.textInterfaceToggle.y,
      paused: true,
      onComplete: () => {
        
        // Unhide elements
        this.interactron.setAlpha(1);
        this.invokerDisc.setAlpha(1);
      }
    });

    this.contextDock = this.add.circle(maxCornerTR.x - 16, maxCornerTR.y + 16, 15).setStrokeStyle(1.6, 0xFFFFFF);
    const contextArea = new Phaser.Geom.Circle(this.contextDock.x, this.contextDock.y, 32);
    this.contextDock.setAlpha(0.24);

    const closerIcon = this.add.container(this.contextDock.x, this.contextDock.y, [
      this.add.rectangle(+1.6, -1.6, 12, 12).setStrokeStyle(1.2, 0xFF225F, 1).setOrigin(),
      this.add.rectangle(-1.6, +1.6, 12, 12).setStrokeStyle(1.2, 0xFF225F, 1).setOrigin(),
    ]);

    closerIcon.setInteractive(contextArea, (a) => this.handleInteraction(a, {
      onClick: () => {
        if (this.termActive) {
          this.invokerDisc.setAlpha(0);
          closeOutline.play();

        }
      }
    }));

    const tiToggleOutline = this.add.graphics().setDepth(-2);

    this.events.on('update', () => {
      const percentExpanded = Phaser.Math.Percent(tiOutlineShape.width, iconSize, maxWidth);
      closerIcon.setAlpha(percentExpanded);

      // Update pip positions
      const lerpedTL = new Phaser.Math.Vector2(pipTL.x, pipTL.y).lerp(maxCornerTL, percentExpanded);
      const lerpedTR = new Phaser.Math.Vector2(pipTR.x, pipTR.y).lerp(maxCornerTR, percentExpanded);
      const lerpedBL = new Phaser.Math.Vector2(pipBL.x, pipBL.y).lerp(maxCornerBL, percentExpanded);
      const lerpedBR = new Phaser.Math.Vector2(pipBR.x, pipBR.y).lerp(maxCornerBR, percentExpanded);
      ti_TopLeft.setPosition(lerpedTL.x, lerpedTL.y);
      ti_TopRght.setPosition(lerpedTR.x, lerpedTR.y);
      ti_BotLeft.setPosition(lerpedBL.x, lerpedBL.y);
      ti_BotRght.setPosition(lerpedBR.x, lerpedBR.y);

      tiToggleOutline.clear()
      .setDepth(-1)
      .lineStyle(2.0, this.IRISActive ? 0x1A1A1A : this.termActive ? 0xFFFFFF : 0xACFC3E, (1 - percentExpanded) + 0.32)
      .strokeRoundedRect(
        tiOutlineShape.x, tiOutlineShape.y, 
        tiOutlineShape.width, tiOutlineShape.height, 
        edgeRadius
      )
      .fillStyle(0x000000, this.IRISActive ? 1 : 0.72)
      .fillRoundedRect(
        tiOutlineShape.x, tiOutlineShape.y,
        tiOutlineShape.width, tiOutlineShape.height,
        edgeRadius
      )
      tiCornerPips.setDepth(10)
      tiCornerPips.setAlpha(this.IRISActive ? 0 : 1);
    });

    this.textInterfaceToggle.add(tiToggleOutline);

    // TI Open & Close Animations
    const tiActivator = new Phaser.Geom.Circle(this.textInterfaceToggle.x, this.textInterfaceToggle.y, iconSize * 1.5);
    this.textInterfaceToggle.setInteractive(tiActivator, (a) => this.handleInteraction(a, {

      onClick: () => {
        if (!this.termActive && !this.IRISActive) {

          // Hide the interactron and waveform lines
          this.interactron.setAlpha(0);
          this.invokerDisc.setAlpha(0);
          centerShift.play();
        }
      } 
    }));

    // IRIS State Indicator & Toggle
    const stateIndicator = this.add.circle(this.contextDock.x, this.contextDock.y, 3, 0xACFC3E);

    const ringPoints = new Phaser.Geom.Circle(
      this.contextDock.x, this.contextDock.y, 
      this.contextDock.radius
    ).getPoints(12);

    const indicatorRings = this.add.container(this.contextDock.x, this.contextDock.y);
    this.events.on('update', () => { stateIndicator.setAlpha(this.mandorlaMode ? 0 : 1)});

    ringPoints.forEach(p => {
      const subRing = this.add.circle(
        p.x - this.contextDock.x, p.y - this.contextDock.y
      ).setStrokeStyle(0.8, 0xFFFFFF, 0.45);

      this.events.on('preupdate', () => {
        subRing.radius = this.IRISActive ? 6 : 1;
        this.contextDock.radius = this.IRISActive ? 24 : 15;
        stateIndicator.radius = this.IRISActive ? 6 : 3;
      });

      indicatorRings.add(subRing);
    });

    this.events.on('update', () => {
      this.contextDock.setAlpha(this.mandorlaMode ? 0 : 0.24);
      stateIndicator.alpha = this.mandorlaMode ? 0 : 1 - closerIcon.alpha;
      indicatorRings.alpha = this.mandorlaMode ? 0 : 1 - closerIcon.alpha;
      indicatorRings.angle++;
    });

    stateIndicator.setInteractive(contextArea, (a) => this.handleInteraction(a, {onClick: () => !this.termActive && this.onDoubleTap()}));
    this.stateIndicator = stateIndicator;
    
    // Define the 2D camera
    this.camera2D = this.cameras.main;
    this.camera2D.centerOn(0, 0);

    // Wire the custom methods into the Phaser and DOM event systems
    window.addEventListener('resize', (r: Event) => this.resetDraw(r));
  }

  private outlineHeight = 163;

  // Called once Phaser.Scene has been fully initialized; Useful for setting up physics, etc.
  create(): void {

    // Settings - Dedicated View Scene
    const settingsButton = this.add.image(this.contextDock.x, this.textInterfaceToggle.y, 'settings').setDepth(25);
    const sbColorize = this.add.circle(settingsButton.x, settingsButton.y, 9, 0xACFC3E, 1).setDepth(24);

    const quickSettings = this.add.graphics({
      x: settingsButton.x, y: settingsButton.y,
      fillStyle: {color: 0x000000, alpha: 0.72},
      lineStyle: {color: 0xFFFFFF, alpha: 0.24, width: 2},
    })
    .strokeRoundedRect(-160, -(36 / 2), 160, 36, 16)
    .fillRoundedRect(-160, -(36 / 2), 160, 36, 16);
    const cutout = this.make.graphics({x: quickSettings.x, y: quickSettings.y})
    .fillCircle(0, 0, 24)
    .createGeometryMask()
    .setInvertAlpha(true);
    quickSettings.setMask(cutout);
    const insetArc = this.add.circle(quickSettings.x - 5, quickSettings.y, 20).setStrokeStyle(3, 0xFFFFFF, 0.24);
    insetArc.setMask(cutout);

    const quickSettingsBar = this.add.container(settingsButton.x, settingsButton.y, [quickSettings, insetArc]);
    // quickSettingsBar.angle = -90;

    // Transcript Viewer
    const transcriptButton = this.add.image((-this.res.w / 2) + 45, this.contextDock.y, 'transcript').setDepth(25);
    const tsColorize = this.add.rectangle(transcriptButton.x, transcriptButton.y, 8, 24, 0xACFC3E).setDepth(24);

    this.events.on('update', () => {

      // TODO: Move this to a better place
      if (this.termActive) {
        this.invokerDisc.alpha = 0;
        this.interactron.alpha = 0;
      }
      settingsButton.angle--;
      settingsButton.setAlpha((this.IRISActive || this.termActive) ? 0 : 1);
      transcriptButton.setAlpha((this.IRISActive || this.termActive) ? 0 : 1);
      sbColorize.setAlpha(settingsButton.alpha);
      tsColorize.setAlpha(transcriptButton.alpha);
      quickSettingsBar.setAlpha(settingsButton.alpha);
    });

    // Hide all avatars when text interface or transcript viewer becomes active
    this.events.on('preupdate', () => {
      if (this.termActive) {
        this.activeAvatar && this.activeAvatar.setAlpha(0);
      } else {
        (!this.menuActive && !this.IRISActive && this.activeAvatar) && this.activeAvatar.setAlpha(1);
      }
    });

    // Populate the UI scene
    const textSize = 36;
    this.programLabel = this.add.text(0, -300, `${this.modeName}`, {
      align: 'center',
      fontSize: `${textSize}px`,
      color: '#000000',
      stroke: '#FFFFFF',
      strokeThickness: 1,
      baselineX: 6,
      baselineY: 24,
      fixedWidth: 200,
      backgroundColor: 'rgba(0, 0, 0, 0.86)',
      fontStyle: 'bolder'
    }).setOrigin().setDepth(999).setAlpha(0);

    this.modeName = '';
    this.game.events.on('menu:activate', () => this.programLabel.setAlpha(1));
    this.game.events.on('menu:deactivate', () => this.programLabel.setAlpha(0));

    // Do last...
    this.finalize();
  }

  // Called once creation has completed
  finalize(): void {

    // System Audio Components
    const mainVolume = new Tone.Volume(-9).toDestination();
    const aye = new Tone.Player('assets/audio/aye.wav').connect(mainVolume);
    const nay = new Tone.Player('assets/audio/nay.wav').toDestination();
    const activate = new Tone.Player('assets/audio/activate.wav').connect(mainVolume);
    const deactivate = new Tone.Player('assets/audio/deactivate.wav').toDestination();
    const staticPulse = new Tone.Player('assets/audio/static_pulse.wav').toDestination();
    const notificationPing = new Tone.Player('assets/audio/notificationPing.wav').toDestination();

    // Menu Audio Components
    const menuOpen = new Tone.Player('assets/audio/openMenu.wav').toDestination();
    const menuClose = new Tone.Player('assets/audio/closeMenu.wav').toDestination();
    const menuSelect = new Tone.Player('assets/audio/menuSelect.wav').toDestination();

    // Iris
    let edgeWidth = 6;
    let linerWidth = edgeWidth * 2;

    let radiusPercent = 0.76;
    let mxRadius = 200;
    let tgRadius = (window.innerWidth / 2) * radiusPercent;
    let irisRadius = tgRadius > mxRadius ? mxRadius: tgRadius;

    const interactronMask = this.make.graphics({x: 0, y: 0})
    .fillCircle(0, 0, 64)
    .createGeometryMask()
    .setInvertAlpha(true);

    const irisLiner = this.add.circle(0, 0, irisRadius + 2)
      .setStrokeStyle(linerWidth, 0x1C1C1C, 0.72)
      .setDepth(-300);

    const irisInner = this.add.circle(0, 0, irisRadius - 6, 0x000000, 0.72)
      .setStrokeStyle(edgeWidth, 0xFFFFFF, 1.0)
      .setDepth(-600)
      .setMask(interactronMask);

    const irisOuter = this.add.circle(0, 0, irisRadius + 6, 0x000000, 0.32)
      .setDepth(-900);

    const IRIS = this.add.container(0, 0, [
      irisInner,
      irisOuter, 
      irisLiner, 
    ]).setDepth(-999);

    IRIS.alpha = 0;
    this.events.on('update', () => IRIS.setAlpha(this.menuActive || !this.IRISActive ? 0 : 1));

    // Use the screen properties to determine if the device is mobile or not
    /* if orientation is portrait at an angle of 0 degrees, the device is mobile due to candybar design */
    this.isMobile = (
      window.screen.orientation.type === 'portrait-primary' && window.screen.orientation.angle === 0
      ||
      window.screen.orientation.type === 'landscape-primary' && window.screen.orientation.angle === 90
    );

    // Non-Touch-Device Cursor - created if client device is not a mobile device
    let NTDCursor: Phaser.GameObjects.Container | null = null;
    if (!this.isMobile) {
      const pipRing = new Phaser.Geom.Circle(0, 0, 12);
      const cursorPips = this.add.container(0, 0);
      pipRing.getPoints(12).forEach(point => cursorPips.add(
        this.add.circle(point.x, point.y, 1, 0x000000, 0)
        .setStrokeStyle(1, 0xFFFFFF, 0.3)
      ));

      const cursorMain = this.add.circle(0, 0, 6, 0xFF0000)
        .setStrokeStyle(1, 0xFFFFFF);

      const cursorEdge = this.add.circle(0, 0, 12)
        .setStrokeStyle(1, 0xFFFFFF, 0.3);

      NTDCursor = this.add.container(0, 0).setDepth(1200);
      NTDCursor.add([
        cursorMain,
        cursorEdge,
        cursorPips
      ]);

      // Touch & NTD Events
      window.addEventListener('touchend', () => this.game.events.emit('cursor:up', {
        x: this.input.activePointer.worldX,
        y: this.input.activePointer.worldY
      }));
      window.addEventListener('pointerup', () => this.game.events.emit('cursor:up', {}));
      window.addEventListener('touchstart', () => this.game.events.emit('cursor:dn', {}));
      window.addEventListener('pointerdown', () => this.game.events.emit('cursor:dn', {}));

      // Event-Reactive NTD Cursor States
      this.game.events.on('cursor:up', () => cursorPips.each((pip: Phaser.GameObjects.Arc) => pip.radius = 1));
      this.game.events.on('cursor:dn', () => cursorPips.each((pip: Phaser.GameObjects.Arc) => pip.radius = 6));

      // When activating the menu or omni-disc, temporarily hide the cursor
      this.game.events.on('menu:activate', () => NTDCursor?.setAlpha(0));
      this.game.events.on('menu:deactivate', () => NTDCursor?.setAlpha(1));
      this.game.events.on('od:activate', () => NTDCursor?.setAlpha(0));
      this.game.events.on('od:deactivate', () => NTDCursor?.setAlpha(1));

      // Sync NTD Cursor position with underlying active pointer & make it slowly spin
      this.events.on('preupdate', () => {
        if (NTDCursor && NTDCursor.alpha === 1) {
          NTDCursor.x = this.input.activePointer.worldX;
          NTDCursor.y = this.input.activePointer.worldY;
          NTDCursor.angle++;
        }
      });
    }

    // NOTE - Radial Menu Controls:
    // Double tap empty space = Activate IRIS
    // Press + Drag on Avatar = Select Program

    this.menuActive = false;
    const menuActivator = this.add.circle(0, 0, 120);
    const activatorTouchArea = new Phaser.Geom.Circle(0, 0, 120);

      // Activate the Radial Menu
    menuActivator.setInteractive(activatorTouchArea, (area) => {
      const posX = this.input.activePointer.worldX;
      const posY = this.input.activePointer.worldY;
      if (
        this.input.activePointer.isDown 
        && 
        area.contains(posX, posY) 
        && 
        !this.menuActive && !this.IRISActive
      ) this.game.events.emit('menu:activate', (this.input.mouse.requestPointerLock()));

      // Deactive the Radial Menu
      if (!this.input.activePointer.isDown && this.menuActive) this.game.events.emit('menu:deactivate', (this.input.mouse.releasePointerLock()));
    }, true);

    this.game.events.on('menu:activate', () => { this.menuActive = true });
    this.game.events.on('menu:deactivate', () => { this.menuActive = false });

    const discRadius = 42;
    const discPosition = 300;

    const ringSize = 2;
    const ringCount = 6;
    const baseRadius = 12;
    const baseAlpha = 0.32;
    const goalAlpha = 1.00;

    const ringColor = 0x367AFF;
    const coreColor = 0x070707;
    
    // Omni-Disc Orbital Core
    const invokerDisc = this.add.circle(0, 0, discRadius + 16, coreColor, 0.64)
    .setStrokeStyle(1.5, 0xFFFFFF, 1).setDepth(-9);

    
    // Interactron Orbital Core
    const interactron = this.add.circle(0, 0, discRadius + 16, coreColor, 0.64)
    .setStrokeStyle(1.5, 0xFFFFFF, 1).setDepth(-9);

    // Sidelines
    const sidelines = this.add.graphics({ lineStyle: { color: 0xFFFFFF, alpha: 0.72, width: 1 }});
    const alphaSideLine = new Phaser.Geom.Line(0, -this.res.h / 2, 0, -discRadius  * 2);
    const OmegaSideLine = new Phaser.Geom.Line(0, +this.res.h / 2, 0, +discRadius * 2);
    const alphaLine = sidelines.strokeLineShape(alphaSideLine);
    const omegaLine = sidelines.strokeLineShape(OmegaSideLine);
    const irisMask = this.make.graphics({})
      .fillCircle(0, 0, 300)
      .createGeometryMask()
      .setInvertAlpha(false)
    ;
    
    sidelines.setMask(irisMask);

    // Mandorla
    this.mandorlaMode = false;
    const mandorlaActivator = new Phaser.Geom.Circle(0, 0, interactron.radius);
    const mandorlaBackfill = this.add.rectangle(0, 0, this.res.w, this.res.h, 0x000000).setDepth(-9999).setAlpha(0);

    const alphaRingOuter = this.add.circle(interactron.x, -discPosition, 360).setStrokeStyle(6, 0xFFFFFF, 0.03);
    const alphaRingInner = this.add.circle(invokerDisc.x, -discPosition, 140).setStrokeStyle(6, 0xFFFFFF, 0.03);
    const omegaRingOuter = this.add.circle(invokerDisc.x, +discPosition, 360).setStrokeStyle(6, 0xFFFFFF, 0.03);
    const omegaRingInner = this.add.circle(invokerDisc.x, +discPosition, 140).setStrokeStyle(6, 0xFFFFFF, 0.03);

    const alphaNode = this.add.circle(interactron.x, -discPosition, 12, 0xFFFFFF, 1);
    const omegaNode = this.add.circle(invokerDisc.x, +discPosition, 12, 0xFFFFFF, 1);

    const earth = this.add.rectangle(-160, 0, 12, 3, 0x3C6AFF, 1).setAlpha(0);
    const stars = this.add.rectangle(+160, 0, 12, 3, 0xFF3A11, 1).setAlpha(0);

    const spatialOrientation = this.add.container(0, 0, [earth, stars]);
    spatialOrientation.setAngle(90);

    // Setup Spatial Movement and Orientation Detectors - Used for sound playback via gestures in Tapehead's Mandorla Mode 
    type Sensor = {
      activated : boolean,
      hasReading: boolean,
      onactivate: null | (() => void),
      onerror: null | (() => void),
      onreading: null | (() => void),
      x: null | number,
      y: null | number,
      z: null | number,
    };

    let gyroscope: Sensor | undefined;
    let accelerometer: Sensor | undefined;
    let gravitySensor: Sensor | undefined;

    if ('Accelerometer' in window) {
      // @ts-ignore | object exists, type definitions are just lacking (as usual)
      accelerometer = new window['Accelerometer']() as Sensor;
    }
    if ('Gyroscope' in window) {
      // @ts-ignore | object exists, type definitions are just lacking (as usual)
      gyroscope = new Gyroscope({ frequency: 60 }) as Sensor;
    }
    if ('GravitySensor' in window) {
      // @ts-ignore | object exists, type definitions are just lacking (as usual)
      gravitySensor = new window['GravitySensor'] as Sensor;
    }

    // Debugger Output - Display when TI is opened
    let debugOutput = ``;
    const Debugger = this.add.text(-(this.res.w / 2) + 36, -(this.res.h / 2) + 36, debugOutput, {
      fontSize: '12px',
      color: '#FFFFFF'
    });

    let deviceMotionX: number | null | undefined = -Infinity;
    let deviceMotionY: number | null | undefined = -Infinity;
    let deviceMotionZ: number | null | undefined = -Infinity;
    let deviceRotationAlpha: number | null | undefined = -Infinity;
    let deviceRotationBeta: number | null | undefined = -Infinity;
    let deviceRotationGamma: number | null | undefined = -Infinity;
    let deviceOrientationAlpha: number | null | undefined = -Infinity;
    let deviceOrientationBeta: number | null | undefined = -Infinity;
    let deviceOrientationGamma: number | null | undefined = -Infinity;

    window.addEventListener('devicemotion', (dme: DeviceMotionEvent) => {
      deviceMotionX = dme.acceleration?.x;
      deviceMotionY = dme.acceleration?.y;
      deviceMotionZ = dme.acceleration?.z;
      deviceRotationAlpha = dme.rotationRate?.alpha;
      deviceRotationBeta = dme.rotationRate?.beta;
      deviceRotationGamma = dme.rotationRate?.gamma;
    });
    window.addEventListener('deviceorientation', (doe: DeviceOrientationEvent) => {
      deviceOrientationAlpha = doe.alpha;
      deviceOrientationBeta = doe.beta;
      deviceOrientationGamma = doe.gamma;

      // deviceOrientationAlpha && (this.activeAvatar.angle = Phaser.Math.Wrap(deviceOrientationAlpha, -180, +180) - 90);
    });

    let touchStart = false;
    let touchEnd = false;
    let touchCancel = false;
    let dragStart = false;
    let isDragging = false;
    let dragEnd = false;
    let doubleClick = false;

    window.addEventListener('dblclick', () => {
      doubleClick = true;
      setTimeout(() => doubleClick = false, 1000);
    });
  
    window.ontouchstart = () => {
      touchStart = true;
      touchEnd = false;
    }
    window.ontouchend = () => {
      touchEnd = true;
      touchStart = false;
    };
    window.ontouchmove = (m: TouchEvent) => {
      console.debug(m)
    }
    

    this.events.on('update', () => {
      const outData = (
        `Device Motion X: ${deviceMotionX}\n`+
        `Device Motion Y: ${deviceMotionY}\n`+
        `Device Motion Z: ${deviceMotionZ}\n`+
        `\r`+
        `Device Rot. Rate Alpha: ${deviceRotationAlpha}\n`+
        `Device Rot. Rate Beta: ${deviceRotationBeta}\n`+
        `Device Rot. Rate Gamma: ${deviceRotationGamma}\n`+
        `\r`+
        `Device Orient. Alpha: ${deviceOrientationAlpha}\n`+
        `Device Orient. Beta: ${deviceOrientationBeta}\n`+
        `Device Orient. Gamma: ${deviceOrientationGamma}\n`+
        `\r`+
        `Touch Actions\n------------\n`+
        `T. Start: ${touchStart}\n`+
        `T. End: ${touchEnd}\n`+
        `Double Click: ${doubleClick}\n`
      );
      debugOutput = `DEBUG OUTPUT \n------------\n${
        outData
      }`;
      Debugger.setText(debugOutput);
      this.mandorlaMode = this.IRISActive ? this.mandorlaMode : false;
      alphaNode.setRadius(this.mandorlaMode ? 12 : 3).setAlpha(this.IRISActive ? 1 : 0);
      omegaNode.setRadius(this.mandorlaMode ? 12 : 3).setAlpha(this.IRISActive ? 1 : 0);
      alphaLine.setAlpha((this.IRISActive && !this.mandorlaMode) ? 1 : 0);
      omegaLine.setAlpha((this.IRISActive && !this.mandorlaMode) ? 1 : 0);

      alphaRingInner.setAlpha(this.mandorlaMode ? 1 : 0);
      alphaRingOuter.setAlpha(this.mandorlaMode ? 1 : 0);
      omegaRingInner.setAlpha(this.mandorlaMode ? 1 : 0);
      omegaRingOuter.setAlpha(this.mandorlaMode ? 1 : 0);

      mandorlaBackfill.setAlpha(this.mandorlaMode ? 1 : 0);
      
      earth.setAlpha(this.mandorlaMode ? 1 : 0);
      stars.setAlpha(this.mandorlaMode ? 1 : 0);

      Debugger.setAlpha((devMode && this.termActive) ? 1 : 0);
    });

    interactron.setInteractive(mandorlaActivator, (a) => this.handleInteraction(a, {
      onClick: () => {
        if (this.IRISActive) {
          this.mandorlaMode = !this.mandorlaMode;
          
        }
      }
    }));

    // Delays to prevent interference with double-tap IRIS activation
    let odActivated = false;
    let commandRecognized = false;
    let holdTimer: NodeJS.Timeout | undefined;
    let holdRegistered = false;

    // Invoker Sounds
    const invokeStart = new Tone.Player('assets/audio/invokeOn.wav').toDestination();
    const invokeEnd = new Tone.Player('assets/audio/invokeOff.wav').toDestination();

    const cancelHold = () => {
      holdRegistered = false;
      clearTimeout(holdTimer); 
      holdTimer = undefined; 
    }
    const stopHold = () => { 
      odActivated = false;
      if (holdRegistered) {
        commandRecognized ? aye.start() : invokeEnd.start();
        this.game.events.emit('od:deactivate', this.input.mouse.releasePointerLock());
      }
      cancelHold();
    };

    const startHold = () => { 
      holdTimer = setTimeout(() => {
        invokeStart.start();
        this.game.events.emit('od:activate', this.input.mouse.requestPointerLock());

        holdRegistered = true;
      }, 300) 
    };

    // Make the invoker disc slowly ripple toward the center using rings
    const rings: Phaser.GameObjects.Arc[] = [];
    const rippleTweens: Phaser.Types.Tweens.TweenBuilderConfig[] = [];
    for (let ringNum = 0; ringNum < ringCount; ringNum++) {
      const ring = this.add.circle(0, 0, baseRadius + ((ringSize) * ringNum))
      .setStrokeStyle(ringSize, ringColor, 1.0)
      .setDepth(-2)
      .setAlpha(baseAlpha);

      const rippleTween: Phaser.Types.Tweens.TweenBuilderConfig = {
        targets: ring,
        yoyo: true,
        props: {
          alpha: goalAlpha
        }
      };
      
      const lastRippleTween: Phaser.Types.Tweens.TweenBuilderConfig = {
        targets: rings,
        yoyo: true,
        hold: 3000,
        ease: 'easeOut',
        duration: 1200,
        props: {
          alpha: goalAlpha
        }
      };

      // Add this ring to ring list
      rings.push(ring);
      rippleTweens.push(rippleTween);

        // On last item, reverse tween array so ripple moves inward
      if (ringNum === ringCount - 1) {
        rippleTweens.reverse();
        rippleTweens.push(lastRippleTween);
      }
    }
    
    const ripple = this.tweens.timeline({
      ease: 'easeIn',
      loop: -1,
      totalDuration: 800,
      tweens: rippleTweens
    });

    // Interactron and InvokerDisc orbitals
    const orbital_GI = new Phaser.Geom.Circle(0, 0, discRadius + 8);
    const orbital_GO = new Phaser.Geom.Circle(0, 0, discRadius + 12);
    const orbital_PI = orbital_GI.getPoints(108);
    const orbital_PO = orbital_GO.getPoints(108);

    const operatorOrbitalOuter = this.add.graphics({
      fillStyle: { color: 0x367AFF, alpha: 1 }
    }).setDepth(-9);
    const computerOrbitalInner = this.add.graphics({
      fillStyle: { color: 0xFFAC00, alpha: 1 }
    }).setDepth(-9);

    // The independent orbitals
    const operatorOrbitalInner = this.add.graphics({
      fillStyle: { color: 0x367AFF, alpha: 1 }
    }).setDepth(25);
    const computerOrbitalOuter = this.add.graphics({
      fillStyle: { color: 0xFFAC00, alpha: 1 }
    }).setDepth(25);

    // draw the inner orbital pips
    orbital_PI.forEach(p => {
      operatorOrbitalInner.fillCircle(p.x, p.y, 1).setDepth(9);
      computerOrbitalInner.fillCircle(p.x, p.y, 1).setDepth(9);
    });

    // draw the outer orbital pips
    orbital_PO.forEach(p => {
      operatorOrbitalOuter.fillCircle(p.x, p.y, 1).setDepth(-5);
      computerOrbitalOuter.fillCircle(p.x, p.y, 1).setDepth(+5);
    });

    this.invokerRoot = {x: 0, y: +discPosition };

    // Add the dependent orbitals and components together in containers
    this.invokerDisc = this.add.container(this.invokerRoot.x, this.invokerRoot.y, [
      invokerDisc, rings, operatorOrbitalOuter
    ].flat());
    this.interactron = this.add.container(0, -discPosition, [
      interactron, computerOrbitalInner
    ].flat());

    computerOrbitalOuter.setPosition(this.interactron.x, this.interactron.y);
    operatorOrbitalInner.setPosition(this.invokerDisc.x, this.invokerDisc.y);

    // Group the independent orbitals together
    this.independentOrbitals = this.add.group([computerOrbitalOuter, operatorOrbitalInner]);

    // Set the alpha for the independent orbitals based on state
    this.events.on('update', () => {
      if (this.IRISActive && !this.mandorlaMode) this.independentOrbitals.setAlpha(1);
      else this.independentOrbitals.setAlpha(this.invokerDisc.alpha);
    });

    // Wire-In Interactivity Logic for the InvokerDisc and Interactron
    const invocationArea = new Phaser.Geom.Circle(
      this.invokerDisc.x, this.invokerDisc.y, 
      invokerDisc.radius + 6
    );
    this.events.on('preupdate', () => invocationArea.setPosition(this.invokerDisc.x, this.invokerDisc.y));

    // TODO: refactor to use the handler method
    invokerDisc.setInteractive(invocationArea, (area) => {
      const posX = this.input.activePointer.worldX;
      const posY = this.input.activePointer.worldY;
      if (!odActivated && this.input.activePointer.isDown && area.contains(posX, posY)) {
        startHold();
        odActivated = true;
      }
      if(!this.input.activePointer.isDown && odActivated) stopHold();
    });
      


    // The Radial Menu
    const menuSlotRing = new Phaser.Geom.Circle(0, 0, irisRadius);

    this.menuSlotNodes = this.add.container();
    const slotArray: Phaser.GameObjects.Container[] = [];
    this.menuSlotNodes.angle = -90;

    const slotPrograms = [
      /* Index = ID */ 
      {
        title: 'TiLLI',
        icon: 'tillibot',
        avatar: new TilliBot_Avatar(0, 0, this),
        description: 'The Talking Large-Language Interface is able to converse with users to help them manage Notes, Tasks, Reminders and serves as an AI-powered personal assistant.'
      },
      {
        title: 'Tapehead',
        icon: 'tapehead',
        avatar: new Tapehead_Avatar(0, 0, this),
        description: 'Tapehead provides features for audio-based notes, messaging, as well as raw sampling.'
      },
      {
        title: 'J-Rod',
        icon: 'eben',
        // avatar: new JRod_Avatar(0, 0, this),
        description: 'J-Rod serves as both a Universal Translator and Vocalization mimic.'
      },
      {
        title: 'Hobb',
        icon: 'robohobb',
        // avatar: new Hobb_Avatar(0, 0, this),
        description: 'Hobb is a user-guided assistant that helps manage settings as well as personal and public data stored within and used by TiLLI.'
      },
      {
        title: 'Wandry',
        icon: 'wandry',
        // avatar: new Wandry_Avatar(0, 0, this),
        description: 'Wandry is a geolocation-powered assistant that helps handle notes, reminders, tasks, and beacons that are associated with different physical locations.'
      }
    ];
    const menuSlots = menuSlotRing.getPoints(slotPrograms.length);


      // Set the main active avatar
      this.activeAvatar = slotPrograms[0].avatar as Avatar;

      // Create the slot nodes
      menuSlots.forEach((point, ID) => {
        const nodeDisc = this.add.circle(point.x, point.y, 2.0, 0x000000, 1.0).setDepth(999);

        // Overlap Area for selection
        const selectionArea = new Phaser.Geom.Circle(nodeDisc.x, nodeDisc.y, 48);

        // Active selection indicator ring
        const sRingGeometry = new Phaser.Geom.Circle(0, 0, 36);
        const selectionRing = this.add.graphics({
          x: 0, y: 0,
          fillStyle: { color: 0xAC00FF, alpha: 1 },
        }).setAlpha(0);

        // Selection Ring - orbital pips
        sRingGeometry.getPoints(32).forEach(p => selectionRing.fillCircle(p.x, p.y, 2).setDepth(999));

        const slotNode = this.add.container(0, 0, [
          nodeDisc, 
        ])
        .setDepth(999);

        // Sync geometries with their gameobject counterparts
        this.events.on('preupdate', () => {
          const worldPosND = nodeDisc.getWorldTransformMatrix();
          nodeDisc.geom.x = worldPosND.tx;
          nodeDisc.geom.y = worldPosND.ty;
          nodeDisc.geom.radius = nodeDisc.radius;
          selectionRing.x = worldPosND.tx;
          selectionRing.y = worldPosND.ty;

          // Rotate the selection ring and match the red line to the ring's alpha
          selectionRing.angle--;

          // Align the selection area
          selectionArea.setPosition(nodeDisc.geom.x, nodeDisc.geom.y);
        });


        // Add the selection area and ring to the slot node
        slotNode.setData('node-disc', nodeDisc);
        slotNode.setData('selection-area', selectionArea);
        slotNode.setData('selection-ring', selectionRing);

        // Add the slot title and ID to the node data as well
        const slotProgram = slotPrograms[ID];
        console.debug(slotProgram)
        slotNode.setData('ID', ID+1);
        slotNode.setData('mode-title', slotProgram.title || '');
        slotNode.setData('mode-avatar', slotProgram.avatar || null);

        const nodeIcon = this.add.image(point.x, point.y, slotProgram.icon);
        nodeIcon.setAngle(90);
        slotNode.add(nodeIcon);

        this.menuSlotNodes.add(slotNode);
        slotArray.push(slotNode);
      });

      // Menu Radial Ring
      const menuRadialRing = this.add.container();
      const menuGeometry = new Phaser.Geom.Circle(0, 0, irisRadius);
      menuGeometry.getPoints(90).forEach(point => {
        menuRadialRing.add(
          this.add.circle(point.x, point.y, 1, 0xFFFFFF)
        )
        .setDepth(IRIS.depth - 1)
        .setAlpha(0);
      });

      const slotMasks = this.make.graphics({})
      menuSlots.forEach(slotPoint => {
        slotMasks
          .fillCircle(slotPoint.x, slotPoint.y, 36)
      });

      slotMasks.setAngle(-90);

      const menuMask = ( slotMasks
        .createGeometryMask()
        .setInvertAlpha(true)
      );

      menuRadialRing.setMask(menuMask);

      // Set the nodes to fade out after the menu deactivates
      const tweenManager = this.tweens;
      
      const fadeOut = tweenManager.create({
        targets: [this.menuSlotNodes.getAll(), menuRadialRing].flat(),
        loop: false,
        ease: 'cubic',
        delay: 1200,
        duration: 600,
        paused: true,
        alpha: 0,
      });
      const fadeIn = tweenManager.create({
        targets: [this.menuSlotNodes.getAll(), menuRadialRing].flat(),
        loop: false,
        ease: 'cubic',
        delay: 0,
        duration: 600,
        paused: true,
        alpha: 1,
      });

      // start the menu with an alpha of 0
      this.menuSlotNodes.each(node => node.alpha = 0);
      this.game.events.on('menu:deactivate', () => fadeOut.play());
      this.game.events.on('menu:activate', () => {fadeIn.play(); if (fadeOut.hasStarted) fadeOut.stop(0)});

      const discs: Phaser.GameObjects.Arc[] = [];

      let taps = 0;
      let canDoubleTap = true;
      const doubleTapDelay = () => { return (
        setTimeout(() => { canDoubleTap = true}, 144)
      )};

      this.onDoubleTap = () => {
        if (canDoubleTap) {

          taps = 0;
          canDoubleTap = false;
          doubleTapDelay();
          
          if (!this.IRISActive) {
            activate.start();
            this.IRISActive = true;

            IRIS.setAlpha(1);
            this.activeAvatar && this.activeAvatar.setAlpha(0);

            this.interactron.alpha = 0;
            this.invokerDisc.alpha = 0;

            this.add.tween({
              targets: [computerOrbitalOuter, operatorOrbitalInner],
              duration: 180,
              ease: 'easeIn',
              x: 0,
              y: 0
            });

            // Haptic Feedback - Activation
            navigator.vibrate([300, 0])
          } 
          else {
            deactivate.start();

            this.add.tween({
              targets: computerOrbitalOuter,
              duration: 160,
              ease: 'easeOut',
              x: 0,
              y: this.interactron.y,

              onComplete: () => {
                IRIS.setAlpha(0);
                this.activeAvatar && this.activeAvatar.setAlpha(1);
                this.interactron.alpha = 1;
                this.invokerDisc.alpha = 1;
              }
            });
            this.add.tween({
              targets: operatorOrbitalInner,
              duration: 160,
              ease: 'easeOut',
              x: 0,
              y: this.invokerDisc.y,

              onComplete: () => this.IRISActive = false
            })

            // Haptic Feedback - Deactivation
            navigator.vibrate([120, 60, 120, 0])
          }
        }
      };

      // Register double-tap recognition for activating the IRIS
      this.input.on('pointerdown', () => {
        if (!invocationArea.contains(
          this.input.activePointer.worldX, 
          this.input.activePointer.worldY
        )) {
          if (taps >= 1 && !this.termActive) this.onDoubleTap();
          else taps++;
        }
      });
      this.input.on('pointerup', () => {
        if (taps === 1) setTimeout(() => taps = 0, 300);
      });

      // If the menu or omni-disc activates, don't count the tap
      this.game.events.on('od:activate', () => taps = 0);
      this.game.events.on('menu:activate', () => taps = 0);

    // IRIS - Tether
    const tetherRing = this.add.circle(0, 0, 12, 0x000000, 1).setStrokeStyle(3, 0xFFFFFF, 1);
    const tetherSpot = this.add.circle(0, 0, 3, 0xFFFFFF, 1);
    const tetherAnchor = this.add.circle(0, 0, 9, 0xFFFFFF, 0);
    const tether = this.add.container(0, 0, [tetherRing, tetherSpot]).setDepth(-1);

    // Match the tether alphas to the menu alpha when menu is not active
    this.events.on('update', () => {
      const menuAlpha = this.menuSlotNodes.getAt(0)['alpha'];
      tether.alpha = menuAlpha;
      tetherAnchor.alpha = menuAlpha;
    })

    // draw a small dotted line from the anchor to the tether
    const tetherLine = new Phaser.Geom.Line();
    const tetherGFX = this.add.graphics({x: 0, y: 0});

    this.events.on('update', () => {
      tetherGFX.clear();
      tetherGFX.fillStyle(0xFFFFFF, 1);

      tetherLine.setTo(
        tetherAnchor.x, tetherAnchor.y,
        tether.x, tether.y
      );

      tetherLine.getPoints(45).forEach((point, pN) => {
        tetherGFX
          .fillCircle(point.x, point.y, pN === 0 ? 9 : 1)
          .setDepth(tether.depth - 1)
      });

      tetherGFX.alpha = tether.alpha;
    });

    // Tracks currently highlighted slot, if any
    let activeSlot: Phaser.GameObjects.Container | null;

    // On Activation of the Radial Menu...
    this.game.events.on('menu:activate', () => {

      // Orient the tether to the top of the radial menu
      let tetherDegrees = Phaser.Math.DegToRad(-90);

      // Hide the active avatar and the waveform lines
      this.activeAvatar && this.activeAvatar.setAlpha(0);

      // Initially move the tether to the top
      Phaser.Math.RotateTo(tether, 0, 0, tetherDegrees, irisLiner.radius);

      // As the cursor moves, rotate the spot along the IRIS
      tether.setInteractive(tether, () => {
        const movementX = this.input.activePointer.movementX;

        if (NTDCursor) {
          tetherDegrees += (movementX) * 0.01;
        } else {
          tetherDegrees = Phaser.Math.Angle.Between(
            menuActivator.x, menuActivator.y,
            this.input.activePointer.worldX, this.input.activePointer.worldY
          );
        }
        Phaser.Math.RotateTo(tether, 0, 0, tetherDegrees, irisLiner.radius);

        // Check each slot node to see if the tether overlaps it
        this.menuSlotNodes.each((node: Phaser.GameObjects.Container) => {
          const selectionArea = node.getData('selection-area') as Phaser.Geom.Circle;
          const selectionRing = node.getData('selection-ring') as Phaser.GameObjects.Arc;
          const selectionAvatar = node.getData('mode-avatar');

          // If the tether is overlapping a node, add node to active slot
          if (selectionArea.contains(tether.x, tether.y)) {

            // Activate haptic pattern based on slot number (uses active slot to prevent spamming the vibrate API)
            let ID = node.getData('ID') as number;
            const pattern: number[] = [100, 120];
            for (let pulses = 0; pulses < ID; pulses++) {
              pattern.push(90, 0)
            }
            node !== activeSlot && navigator.vibrate(pattern);

            // Show the selection ring and a hint the selected mode's avatar
            selectionRing.alpha = 1;

            // Add to highlighted slot tracker
            activeSlot = node;
          }

          // If this node is not the active one, ensure that it is not visible
          if (activeSlot !== node) {
            selectionRing.alpha = 0;
            selectionAvatar !== null && selectionAvatar.setAlpha(0);
          }
          this.modeName = `${activeSlot?.getData('mode-title') || ''}`;
        });

        // Check the active slot: if no longer overlapped, remove from list
        if (activeSlot) {

          // Selection Props
          const selectionArea = activeSlot.getData('selection-area') as Phaser.Geom.Circle;
          const selectionRing = activeSlot.getData('selection-ring') as Phaser.GameObjects.Arc;
          const selectionAvatar = activeSlot.getData('mode-avatar') as Avatar;

          // Temporarily show the associated avatar at a smaller scale within a badge
          if (selectionAvatar) {
            selectionAvatar.setScale(0.6);
            selectionAvatar.setAlpha(1);
          }

          if (!selectionArea.contains(tether.x, tether.y)) {
            selectionAvatar?.setAlpha(0);
            activeSlot = null;
            selectionRing.alpha = 0;
            this.modeName = '';
          }
        }
      });
    });
    
    // TODO: Add logic for launching the different mode programs
    this.game.events.on('menu:deactivate', () => {
      tether.setPosition(0,0);
      tether.removeInteractive();

      // Reset the alpha and scale to all slot avatars if there is not an active slot
      slotPrograms.forEach(prog => prog.avatar !== activeSlot?.getData('mode-avatar') && prog.avatar?.setAlpha(0).setScale(1));

      // Fetch the active slot's avatar if one exists
      const activeSlotAvatar = activeSlot?.getData('mode-avatar');

      // if there is an active slot, launch it's associated program
      if (activeSlot) {
        activeSlotAvatar && (this.activeAvatar = activeSlotAvatar);
        const selectionRing = activeSlot.getData('selection-ring') as Phaser.GameObjects.Arc;
        this.add.tween({
          delay: 300,
          duration: 600,
          ease: 'easeIn',

          targets: selectionRing,
          alpha: 0,

          onStart: () => {
            activeSlotAvatar && menuSelect.start() || menuClose.start()
          },

          /* TODO: Launch associated mode scene */
          onComplete: () => {
            if (!this.termActive && this.activeAvatar && activeSlotAvatar) this.activeAvatar.alpha = this.IRISActive ? 0 : 1;
            this.activeAvatar && this.add.tween({
              targets: this.activeAvatar,
              duration: 300,
              ease: 'easeIn',
              scale: 1,
            })
          }
        });
      } 
    });

    const outermostRing = rings[rings.length-1];

    // Stop the ripple animation on the omni-disc and set all rings to full brightness
    const suspendRippleAnimation = (targetAlpha: number) => {
      ripple.data.forEach((tween, tN) => {
        let target = tween.targets[0];
        target.setStrokeStyle(
          tN === 0 ? ringSize * 3 : ringSize, 
          target.strokeColor, 
          target.strokeAlpha
        );
        target.alpha = targetAlpha;
      });
      ripple.pause();
      ripple.resetTweens(false);

      // Expand the Omni-Disc
      this.add.tween({
        targets: outermostRing,
        ease: 'cubic',
        duration: 108,
        loop: false,
        radius: discRadius
      });
    };

    // Restart the ripple animation
    const resumeRippleAnimation = () => {
      outermostRing.setStrokeStyle(
        ringSize, 
        outermostRing.strokeColor, 
        outermostRing.strokeAlpha
      );
      ripple.data.forEach((tween) => {
        let target = tween.targets[0];
        target.setStrokeStyle(
          ringSize, 
          target.strokeColor, 
          target.strokeAlpha
        );
        target.alpha = baseAlpha;
      });

      // Close this Omni-Disc
      this.add.tween({
        targets: outermostRing,
        ease: 'power1',
        duration: 108,
        loop: false,
        radius: baseRadius,
      });

      ripple.resume();
    };

    this.game.events.on('od:deactivate', () => resumeRippleAnimation());
    this.game.events.on('od:activate', () => suspendRippleAnimation(1));

    // Select on Release, or Cancel
    this.game.events.on('menu:deactivate', () => {

      // Close the node discs
      slotArray.forEach((slot) => {
        this.add.tween({
          targets: slot.getData('node-disc'),
          ease: 'power1',
          duration: 60,
          loop: false,
          radius: 3.0
        })
      });

      // Play menu close sfx if there is not a selected slot
      !activeSlot && menuClose.start();
      // Trigger Haptic Feedback
      !activeSlot && navigator.vibrate([96, 6, 96, 0]) || navigator.vibrate([120, 60, 96, 0]);
      resumeRippleAnimation();
    });

    this.game.events.on('menu:activate', () => {

      if (this.activeAvatar) this.activeAvatar.alpha = 0;

      // expand the slot node discs
      slotArray.forEach((slot) => {
        this.add.tween({
          targets: slot.getData('node-disc'),
          ease: 'power1',
          duration: 30,
          loop: false,
          radius: 32
        });
      });

      menuOpen.start();
      navigator.vibrate([96, 0]);
      suspendRippleAnimation(0);
    });

      // Trigger the trans glitch effect and static pulse every few minutes as a soft screensaver
      const schism = () => setTimeout(() => {
        staticPulse.start(3, Phaser.Math.Between(0.01, 1.00), 0.33);
        transGlitch.enabled = true;
        setTimeout(() => {transGlitch.enabled = false;}, 333);
        !this.isQuietTime && schism();
      }, Phaser.Math.Between(12_000, 120_000));
      schism();

      // Animate orbitals
      this.events.on('update', () => {
        operatorOrbitalOuter.angle -= 0.6;
        computerOrbitalOuter.angle += 0.6;
        computerOrbitalInner.angle -= 0.6;

        // Counter rotates in IRIS mode
        this.IRISActive ? operatorOrbitalInner.angle -= 0.6 : operatorOrbitalInner.angle += 0.6;
      });


    const interactronPrism_G = new THREE.IcosahedronGeometry(2, 1);
    const interactronPrism_M = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      wireframe: true,
      opacity: 0.36,
      transparent: true
    });
    const interactronPrism = new THREE.Mesh(interactronPrism_G, interactronPrism_M);

    this.game.events.on('menu:activate', () => interactronPrism.visible = false);
    this.game.events.on('menu:deactivate', () => interactronPrism.visible = true);

    interactronPrism.rotation.set(
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(0),
      Phaser.Math.DegToRad(0)
    );
    const projectionScene = new THREE.Scene();

    const projector = new OffscreenCanvas(100, 100);
    const projectionCamera = new THREE.PerspectiveCamera(55, projector.width / projector.height, 0.1, 100);
    const proRender = new THREE.WebGLRenderer({ canvas: projector });
    const preTexture = new THREE.CanvasTexture(projector);
    const projectionGeometry = new THREE.CircleGeometry(100 / 2);
    const projectionMaterial = new THREE.MeshBasicMaterial({ map: preTexture, side: THREE.BackSide, transparent: true });
    const projection = new THREE.Mesh(projectionGeometry, projectionMaterial);
    projectionScene.add(interactronPrism);

    projectionCamera.position.z = 5;
    this.rootScene.add(projection);

    this.events.on('update', () => {
      preTexture.needsUpdate = true;
      projection.position.set(0, this.IRISActive ? 0 : this.interactron.y, -1);

      if (this.termActive /* || this.showTranscript */) {
        projection.visible = false;
      } else {
        projection.visible = true;
      }
      proRender.render(projectionScene, projectionCamera);
    });

    const devMode = true;

    const TILLI =  new SpeechSynthesisUtterance();
    const speech = window.speechSynthesis;
    speech.getVoices();

    TILLI.voice = window.speechSynthesis.getVoices()[5];
    TILLI.lang = 'en-GB';
    TILLI.rate = 1.12;
    TILLI.pitch = 0.32;
    if (devMode) {
      TILLI.text = ``
    } else {
      TILLI.text = `Greetings Operator.`;
      setTimeout(() => {
        TILLI.text = `Shall we play a game?`;
        speech.speak(TILLI);
      }, 30_000);
    }
    speech.speak(TILLI);

    // Background SFX List
    const subVol = new Tone.Volume(-12).toDestination();

    const FX: Tone.Player[] = [
      new Tone.Player('assets/audio/ScreenHum.wav').toDestination(),
      new Tone.Player('assets/audio/EMF_Noise.wav').toDestination(),
      new Tone.Player('assets/audio/scannerFX.wav').connect(subVol),
      new Tone.Player('assets/audio/BrokenSig.wav').connect(subVol),
    ];
    
    // Select and play a random BG SFX every 30 seconds to 2 minutes
    const playFX = () => setTimeout(() => {
      const fxPlayer = (Phaser.Utils.Array.GetRandom(FX) as Tone.Player);
      if (fxPlayer.state === 'stopped') fxPlayer.start();
      !this.isQuietTime && playFX();
    }, Phaser.Math.Between(30_000, 120_000));
    playFX();

    // Timing Bells
    const bellVolume = new Tone.Volume(-3).toDestination();
    this.bell01H = new Tone.Player('assets/audio/Bell01H.wav').connect(bellVolume);
    this.bell10M = new Tone.Player('assets/audio/Bell10M.wav').connect(bellVolume);
    let pastHour: number | null = null;

    Tone.Offline(() => {

      setInterval(() => {
        // Check the clock for every 5M, 10M, 1H and 2H period
        this.onlineTD.setTime(Date.now());
        !pastHour && (pastHour = this.onlineTD.getHours());

        // Don't play the bells after 11PM
        this.isQuietTime = this.onlineTD.getHours() >= 23 || this.onlineTD.getHours() <= 7;

        if (!this.isQuietTime) {
          if (this.onlineTD.getMinutes() % 10 === 0) {

            // If its a new hour, play the Hour Bell...
            if (this.onlineTD.getHours() !== pastHour) {
              !this.played01H && this.bell01H.start();
              this.played01H = true;

            // ...otherwise play the 10 Minute Bell
            } else {
              !this.played10M && this.bell10M.start(); 
              this.played10M = true;
              this.played01H = false;
            }
          } else {
            this.played10M = false;
          }
        }
      }, 1000);
    }, 0.1, 2);

    // Setup Post-Processing and FX for Three
    const comp = new EffectComposer(this.rootRenderer);
    const vec2res = new THREE.Vector2(this.res.h, this.res.w); /* for passes that require a vec2 resolution */

    // Base renders to apply all post-processing FX to
    const rootPass = new TAARenderPass(this.rootScene, this.camera3D, 0x997C9F, 0.24);
    const tx2DPass = new TexturePass(this.phaseTexture, 0.9);

    // Bloom & Glow FX
    const hazyGlow = new UnrealBloomPass(vec2res, 0.63, 0.003, 0.001);

    // Aesthetic FX
    const retroCRT = new FilmPass(0.64, 0.39, window.screen.height * 2, 0);
    const timeHaze = new AfterimagePass(0.3);
    const normalize = new AdaptiveToneMappingPass(true, 64);

    // Glitch effect to be triggered during scene transitions
    const transGlitch = new GlitchPass(-1);
    transGlitch.randX = 0.001;
    transGlitch.curF = 0.00001;
    transGlitch.enabled = false;

    const contours = new OutlinePass(vec2res, this.rootScene, this.camera3D, this.obj3D);
    contours.visibleEdgeColor = new THREE.Color(0xFFFFFF);
    contours.edgeGlow = 2;
    contours.edgeStrength = 1;
    contours.edgeThickness = 1;
    
    // Post-Processing "stack" - ordering sensitive
    comp.addPass(rootPass);
    comp.addPass(tx2DPass);
    // comp.addPass(contours);
    comp.addPass(transGlitch);
    comp.addPass(timeHaze);
    comp.addPass(hazyGlow);
    comp.addPass(normalize);
    comp.addPass(retroCRT);

    // periodically reset the internal clock for the retroCRT shader to mitigating banding;
    setInterval(() => {
      retroCRT.uniforms['time'] = new THREE.Uniform(0);
    }, 3000);

    this.events.on('update', () => {
      interactronPrism.rotation.y -= 0.01;
      interactronPrism.rotation.x += 0.01;
      interactronPrism.rotation.z -= 0.01;
      comp.render();
    });
  }

  private onlineTD = new Date();
  private bell10M: Tone.Player;
  private bell01H: Tone.Player;

  played01H: boolean = false;
  played10M: boolean = false;

  // Called each animation frame at a duty cycle of 60
  update(): void {
    this.phaseTexture.needsUpdate = true;

    this.camera3D.updateProjectionMatrix();
    this.camera3D.updateWorldMatrix(true, true);

    this.programLabel.text = this.modeName !== 'MAIN' ? this.modeName : '';
  }

  // Called during fullscreen & resize events to reset drawing params
  resetDraw(resizeEvent?: Event): void {}
}
