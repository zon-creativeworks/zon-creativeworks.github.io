export default class VoiceSynthesizer {
    speech: SpeechSynthesis;
    phrase: SpeechSynthesisUtterance;
    private voices;
    private vocalTone;
    private defaultLang;
    private rateOfSpeech;
    private speechVolume;
    constructor();
    say(phraseText?: string, onFinishedSpeaking?: () => void): void;
}
