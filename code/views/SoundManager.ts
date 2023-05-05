import Tone from 'tone';
import * as THREE from 'three';
export default class SoundManager {
    // Props - Audio
  private onlineTD = new Date();
  private bell10M: Tone.Player;
  private bell01H: Tone.Player;
  private played01H: boolean = false;
  private played10M: boolean = false;
    public isQuietTime: boolean = false;
  constructor() {

    // Text Interface SFX
    const open = new Tone.Player('public/assets/audio/terminalOpen.wav').toDestination();
    const shut = new Tone.Player('public/assets/audio/terminalClose.wav').toDestination();

    // System Audio Components
    const mainVolume = new Tone.Volume(-9).toDestination();
    const aye = new Tone.Player('public/assets/audio/aye.wav').connect(mainVolume);
    const nay = new Tone.Player('public/assets/audio/nay.wav').toDestination();
    const activate = new Tone.Player('public/assets/audio/activate.wav').connect(mainVolume);
    const deactivate = new Tone.Player('public/assets/audio/deactivate.wav').toDestination();
    const staticPulse = new Tone.Player('public/assets/audio/static_pulse.wav').toDestination();
    const notificationPing = new Tone.Player('public/assets/audio/notificationPing.wav').toDestination();

    // Menu Audio Components
    const menuOpen = new Tone.Player('public/assets/audio/openMenu.wav').toDestination();
    const menuClose = new Tone.Player('public/assets/audio/closeMenu.wav').toDestination();
    const menuSelect = new Tone.Player('public/assets/audio/menuSelect.wav').toDestination();

        // Background SFX List
    const subVol = new Tone.Volume(-12).toDestination();

    const FX: Tone.Player[] = [
      new Tone.Player('public/assets/audio/ScreenHum.wav').toDestination(),
      new Tone.Player('public/assets/audio/EMF_Noise.wav').toDestination(),
      new Tone.Player('public/assets/audio/scannerFX.wav').connect(subVol),
      new Tone.Player('public/assets/audio/BrokenSig.wav').connect(subVol),
    ];
    
    // Select and play a random BG SFX every 30 seconds to 2 minutes
    const playFX = () => setTimeout(() => {
      const fxPlayer = (FX[THREE.MathUtils.randInt(0, FX.length-1)] as Tone.Player);
      if (fxPlayer.state === 'stopped') fxPlayer.start();
      !this.isQuietTime && playFX();
    }, THREE.MathUtils.randInt(30_000, 120_000));
    playFX();

    // Timing Bells
    const bellVolume = new Tone.Volume(-3).toDestination();
    this.bell01H = new Tone.Player('public/assets/audio/Bell01H.wav').connect(bellVolume);
    this.bell10M = new Tone.Player('public/assets/audio/Bell10M.wav').connect(bellVolume);
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
  }

  private load(): void {}
  public play(name: string): void {}
  public stop(name: string): void {}
  public mute(name: string): void {}
}