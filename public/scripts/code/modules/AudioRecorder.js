"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class AudioRecorder {
    constructor() {
        this.recordedChunks = [];
        this.dbName = 'AiDA_Audio';
        this.storeName = 'UserRecordings';
        document.addEventListener('DOMContentLoaded', () => __awaiter(this, void 0, void 0, function* () {
            console.debug('recorder initialized');
            try {
            }
            catch (error) {
                console.error('Unable to access audio devices', error);
            }
        }));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mediaStream = yield navigator.mediaDevices.getUserMedia({ audio: true });
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
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug('recorder started');
            yield this.init();
            this.mediaRecorder.start();
            setTimeout(() => { this.stop(); }, 12000);
        });
    }
    stop() { this.mediaRecorder.stop(); }
    saveRecording() { }
    findRecording() { }
    editRecording() { }
    deleteRecording() { }
    updateRecording() { }
}
exports.default = AudioRecorder;
//# sourceMappingURL=AudioRecorder.js.map