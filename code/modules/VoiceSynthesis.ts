export default class VoiceSynthesizer {

  public speech: SpeechSynthesis;
  public phrase: SpeechSynthesisUtterance;

  private voices: SpeechSynthesisVoice[];
  private vocalTone: number = 0.3;
  private defaultLang: string = 'en-GB';
  private rateOfSpeech: number = 1.1;
  private speechVolume: number = 0.3;

  constructor() {
        if ('speechSynthesis' in window || 'webkitSpeechSynthesis' in window) {
          console.debug(`-- Module Loaded: Voice Synth --`);

          this.speech = window.speechSynthesis;
          this.phrase = new SpeechSynthesisUtterance(
            ('webkitSpeechRecognition' in window) ?
              `Greetings, Operator! you can call me Sam!`
              :
              `Oh no, 
              it seems I will not be able to hear you, 
              but I can still speak to you and read any text you write.`
          );

          // Get the voices from the browser
          this.voices = this.speech.getVoices();
          
          // Set a gender-neutral voice
          this.speech.onvoiceschanged = (vc) => { 
            this.phrase.pitch = this.vocalTone    ;
            this.phrase.lang = this.defaultLang   ;
            this.phrase.rate = this.rateOfSpeech  ;
            this.phrase.volume = this.speechVolume;

            // @ts-ignore - due to window.browserType being custom added
            this.phrase.voice = this.voices[(window.browserType === 'chrome|safari') ? 5 : 4];
          }

          
          this.phrase.onstart = () => {
            console.debug('--[ AiDA: Speaking ]--');
          };

          this.phrase.onend = () => {
            console.debug('--[ AiDA: Listening ]--');
          };
        }
        else console.error('-- Error: Speech Synthesis is unavailable. --');
  }

  public say(phraseText?: string, onFinishedSpeaking?: () => void): void {
    if (phraseText) { this.phrase.text = phraseText };
    
    if (onFinishedSpeaking) {
      this.phrase.onend = () => onFinishedSpeaking();
    }
    this.speech.speak(this.phrase);
  }
}