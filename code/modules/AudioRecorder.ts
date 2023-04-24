export default class AudioRecorder {
  private mediaStream: MediaStream;
  private audioContext: AudioContext;
  private mediaRecorder: MediaRecorder;
  private recordedChunks: Blob[] = [];

  private db: IDBDatabase;
  private dbName: string = 'AiDA_Audio';
  private storeName: string = 'UserRecordings';

  constructor() {
    document.addEventListener('DOMContentLoaded', async () => { 
      // Check for Web Audio and Media Devices; Prioritizing Web Audio first
      console.debug('recorder initialized');
      try {
        
      } catch (error) {
        console.error('Unable to access audio devices', error);
      }
    });
  }
  private async init() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.audioContext = new AudioContext();
    } catch (error) {
      console.error(error);
      throw error;
    }
    
    this.mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
      console.debug('recording available');
      this.recordedChunks.push(event.data);
    });
  }

  public async start() {
    console.debug('recorder started');
    await this.init();
    this.mediaRecorder.start();

    setTimeout(() => {this.stop()}, 12000);
  }
  public stop(): void {this.mediaRecorder.stop();}

  // Different methods for storing and retrieving audio from indexed db
  public saveRecording(): void { }
  public findRecording(): void { }
  public editRecording(): void { }
  public deleteRecording(): void { }
  public updateRecording(): void { }

}