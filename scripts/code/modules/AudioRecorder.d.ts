export default class AudioRecorder {
    private mediaStream;
    private audioContext;
    private mediaRecorder;
    private recordedChunks;
    private db;
    private dbName;
    private storeName;
    constructor();
    private init;
    start(): Promise<void>;
    stop(): void;
    saveRecording(): void;
    findRecording(): void;
    editRecording(): void;
    deleteRecording(): void;
    updateRecording(): void;
}
