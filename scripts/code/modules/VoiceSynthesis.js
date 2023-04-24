export default class VoiceSynthesizer {
    speech;
    phrase;
    voices;
    vocalTone = 0.3;
    defaultLang = 'en-GB';
    rateOfSpeech = 1.1;
    speechVolume = 0.3;
    constructor() {
        if ('speechSynthesis' in window || 'webkitSpeechSynthesis' in window) {
            console.debug(`-- Module Loaded: Voice Synth --`);
            this.speech = window.speechSynthesis;
            this.phrase = new SpeechSynthesisUtterance(('webkitSpeechRecognition' in window) ?
                `Greetings, Operator! you can call me Sam!`
                :
                    `Oh no, 
              it seems I will not be able to hear you, 
              but I can still speak to you and read any text you write.`);
            this.voices = this.speech.getVoices();
            this.speech.onvoiceschanged = (vc) => {
                this.phrase.pitch = this.vocalTone;
                this.phrase.lang = this.defaultLang;
                this.phrase.rate = this.rateOfSpeech;
                this.phrase.volume = this.speechVolume;
                this.phrase.voice = this.voices[(window.browserType === 'chrome|safari') ? 5 : 4];
            };
            this.phrase.onstart = () => {
                console.debug('--[ AiDA: Speaking ]--');
            };
            this.phrase.onend = () => {
                console.debug('--[ AiDA: Listening ]--');
            };
        }
        else
            console.error('-- Error: Speech Synthesis is unavailable. --');
    }
    say(phraseText, onFinishedSpeaking) {
        if (phraseText) {
            this.phrase.text = phraseText;
        }
        ;
        if (onFinishedSpeaking) {
            this.phrase.onend = () => onFinishedSpeaking();
        }
        this.speech.speak(this.phrase);
    }
}
//# sourceMappingURL=VoiceSynthesis.js.map