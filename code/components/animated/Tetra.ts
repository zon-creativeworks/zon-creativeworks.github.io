import PointRing from "../../utilities/PointRing";

// This is an animated self-contained shape formed of 3 dots in a triangle, that rotates on a central axis
export default class Tetra extends Phaser.GameObjects.Container {
  constructor(s: Phaser.Scene, x: number, y: number, size: number) {
    super(s, x, y);
    this.size = size;
    this.init(); // Seriously? I need to manually call this?
  }

  private size: number;
  private closed: boolean = true;
  private rotationRate: number = 3;
  public vector: Phaser.Math.Vector2;

  // Animation properties
  private isPlaying: boolean = false;
  private openTween: Phaser.Tweens.Tween;
  private closeTween: Phaser.Tweens.Tween;
  private dots: Phaser.GameObjects.Arc[] = [];

  // Used to create points that the dots will move to on open and close
  private dotRing: PointRing;

  // Switches the closed/open state when called
  public async toggle() {
    
    // TODO: Fix this garbage
    // if (!this.isPlaying) {
    //   this.closed ? this.openTween.play() : this.closeTween.play();
    // } else {
    //   // If a previous animation is still playing, create a one-off event handler for completion of it
    //   this.scene.events.once('anim:complete', () => this.closed ? this.openTween.play() : this.closeTween.play());
    // }
  }

  init(): void {
    this.width = this.size;
    this.height = this.size;
    this.vector = new Phaser.Math.Vector2(this.x, this.y);
    this.dotRing = new PointRing(this.scene, 0, 0, 0);

    // Create the orbital dots
    this.dotRing.getPoints(3).forEach(point => {
      let dot = this.scene.add.circle(point.x, point.y, 3, 0xFFFFFF, 1).setStrokeStyle(2, 0x000000, 1);
        this.dots.push(dot);
    });
    // TODO: Get the orbital dots to fucking stay centered on the container position
    
    // TODO: Create the shadow rays that connect the orbital dots
    
    // If this is closed, all three dots should sit in the center of the cursor;
    // this.closeTween = this.scene.add.tween({
    //   ease: 'linear',
    //   targets: [this.dots[0], this.dots[1], this.dots[2]],
    //   props: {
    //     x: this.dotRing.x,
    //     y: this.dotRing.y
    //   },
    //   yoyo: false,
    //   paused: true,
    //   duration: 12, /* total frames # */
    //   useFrames: true,
    //   persist: true,
    //   onActive: () => {
    //     this.isPlaying = true;
    //     this.dotRing.contract(1)
    //   },
    //   onComplete: () => { this.closed = true, this.isPlaying = false },
    // });

    // If this is opened (!closed), all three dots should expand out to their original open-state positions
    // this.openTween = this.scene.add.tween({
    //   ease: 'linear',
    //   targets: [this.dots[0], this.dots[1], this.dots[2]],
    //   yoyo: false,
    //   paused: true,
    //   duration: 10,
    //   useFrames: true,
    //   persist: true,
    //   onActive: () => {
    //     this.dotRing.expand(36);
    //     this.isPlaying = true;
    //   },
    //   onComplete: () => {
    //     this.closed = false;
    //     this.isPlaying = false;
    //     this.scene.events.emit('anim:complete');
    //   },
    //   onUpdate: (tween) => {
    //     const pointDestinations = this.dotRing.getPoints(3);
    //     pointDestinations.forEach(position => { 
    //       const offset = Phaser.Math.Distance.Between(position.x, position.y, this.vector.x, this.vector.y);
    //       position.x -= offset;
    //       position.y -= offset;
    //     });
    //     tween.targets.forEach((dot, positionIndex) => {
    //       let d = (<Phaser.GameObjects.Arc>dot);
    //       let targetPosition = pointDestinations[positionIndex];
    //       d.x = Phaser.Math.FromPercent(tween.progress, 0, targetPosition.x);
    //       d.y = Phaser.Math.FromPercent(tween.progress, 0, targetPosition.y);
    //     });
    //   }
    // });

    this.add(this.dots);
    this.add(this.dotRing);
    this.addToUpdateList();
    this.addToDisplayList();
  };

  preUpdate(): void {

    // Animates the dots rotating clockwise when open; resets to 0 when closed
    !this.closed && (this.angle += this.rotationRate) || (this.angle = 0);

    // Updates the position of this container to match it's vector properties
    this.x = this.vector.x;
    this.y = this.vector.y;
  }
}