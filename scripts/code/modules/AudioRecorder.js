export default class AudioRecorder {
    mediaStream;
    audioContext;
    mediaRecorder;
    recordedChunks = [];
    db;
    dbName = 'AiDA_Audio';
    storeName = 'UserRecordings';
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            console.debug('recorder initialized');
            try {
            }
            catch (error) {
                console.error('Unable to access audio devices', error);
            }
        });
    }
    async init() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.audioContext = new AudioContext();
        }
        catch (error) {
            console.error(error);
            throw error;
        }
        this.mediaRecorder.addEventListener('dataavailable', (event) => {
            console.debug('recording available');
            this.recordedChunks.push(event.data);
        });
    }
    async start() {
        console.debug('recorder started');
        await this.init();
        this.mediaRecorder.start();
        setTimeout(() => { this.stop(); }, 12000);
    }
    stop() { this.mediaRecorder.stop(); }
    saveRecording() { }
    findRecording() { }
    editRecording() { }
    deleteRecording() { }
    updateRecording() { }
}
//# sourceMappingURL=AudioRecorder.js.map