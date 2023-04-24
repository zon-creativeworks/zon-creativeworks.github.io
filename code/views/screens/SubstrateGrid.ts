import AiDA, {
  UI_Layers, 
  DialogLine,
} from '../TiLLI';


// Main view field for AiDA;
// The different interaction and data nodes live here rather than on disparate screens
export default class SubstrateGrid extends Phaser.Scene {
  constructor() { super('SubstrateGrid') }
  
  // The current dialogue transcript
  private caret: Phaser.GameObjects.Text;
  private isTyping: boolean = false;
  private transcript: Transcript;

  init(): void {
    this.cameras.main.centerOn(0, 0);
    this.transcript = new Transcript();
  };

  create(): void {

    // Dialogue Output Area
    const consolePadding = 32;
    const consoleZone = this.add.zone(
      consolePadding / 2,
      consolePadding / 2,
      window.innerWidth - consolePadding,
      window.innerHeight - consolePadding
    );
    UI_Layers['console'] = consoleZone;

    // Animated Caret
    let visible = false;
    let blinkRate = 300;
      const state = {
      on:  '█',
      off: ' '
    };
    this.caret = this.add.text(0, 0, state.on, {});
    
    // Move caret into proper position
    Phaser.Display.Align.In.TopLeft(this.caret, consoleZone);

    // Configure caret blinking animation
    setInterval(() => { visible = !visible }, blinkRate);
    this.events.on('preupdate', () => this.caret.setText(this.isTyping ? state.on : `${visible ? state.on : state.off}`));

    // Process down clicks as a PTT mechanism
    this.game.events.on('dnclick', () => {
      (this.scene.get('AiDA') as AiDA).glyphcode === 0x00 && this.game.events.emit('status', 0x02);
    });
    this.game.events.on('upclick', () => { 
      this.game.events.emit('status', 0x00);
    });

    // TODO: Integrate Whisper Diarization for text colorization
    this.addDialog('Don\'t forget to add diarization via whisper.');
  }

  update(): void { 
    const AiDA = this.scene.get('AiDA') as AiDA;
    this.caret.alpha = AiDA.MODE === 'CONSOLE' ? 1 : 0;
    this.transcript.baseArray.forEach((dialogLine: DialogLine) => { 
      dialogLine.alpha = AiDA.MODE === 'CONSOLE' ? 1 : 0;
    });

    AiDA.MODE = 'MAIN';
  };
  
  // If addDialog is called before the previous line has finished printing,
  // add it to this queue instead
  private dialogQueue: string[] = [];

  public addDialog(dialog?: string): void  {
    dialog = !dialog ? '\n' : dialog;

    // record the initial caret position prior to moving on print
    let initialPosition = {
      x: this.caret.x,
      y: this.caret.y
    }

    const style = {
      fill: `rgba(255, 255, 255, 0.3)`,
      stroke: `rgba(255, 200, 0, 1.0)`,
    };

    // Create a DialogLine object from the dialogue text
    let newLine: DialogLine;

      // is dialog not a newline character, but does contain them?
    if (dialog !== '\n' && dialog.includes('\n')) {
      dialog.split('\n').forEach(line => {
        
        // Create a new dialog line for each individual row
        newLine = new DialogLine(this, line, style);
        
        // Start the line at the caret position
        newLine.x = initialPosition.x;
        newLine.y = initialPosition.y;

        if (!this.isTyping) {
          
          // Add each new dialog line to the transcript list
          this.transcript.push(
            newLine, {
              onStart: () => {
                this.isTyping = true;
                if (this.isTyping || this.dialogQueue.length > 0) this.game.events.emit('status', 0x01);
                else this.game.events.emit('status', 0x00);
              },
            onEnd: () => {
              this.isTyping = false;
          
              // perform a "carriage return" on the caret
              this.caret.x = initialPosition.x;
              this.caret.y = initialPosition.y + newLine.height;
                
              // Add any dialogue from queue
              const queuedLine = this.dialogQueue.shift();
              queuedLine && this.addDialog(queuedLine);
              if (this.isTyping || this.dialogQueue.length > 0) this.game.events.emit('status', 0x01);
              else this.game.events.emit('status', 0x00);
            },
            onChar: (char) => {
              this.caret.x = initialPosition.x + newLine.width;
            }
          });
        }
        else { this.dialogQueue.push(line) }
      });
    }
    
    else {
      newLine = new DialogLine(this, dialog, style);

      // Start the line at the caret position
      newLine.x = initialPosition.x;
      newLine.y = initialPosition.y;

      if (!this.isTyping) {
        // Add the new dialog line to the transcript list
        this.transcript.push(
          newLine, {
            onStart: () => {
              this.isTyping = true;
              if (this.isTyping || this.dialogQueue.length > 0) this.game.events.emit('status', 0x01);
              else this.game.events.emit('status', 0x00);
            },
            onEnd: () => {
              this.isTyping = false;
      
              // perform a "carriage return" on the caret
              this.caret.x = initialPosition.x;
              this.caret.y = initialPosition.y + newLine.height;
                
              // Add any dialogue from queue
              const queuedLine = this.dialogQueue.shift();
              queuedLine && this.addDialog(queuedLine);
              if (this.isTyping || this.dialogQueue.length > 0) this.game.events.emit('status', 0x01);
              else this.game.events.emit('status', 0x00);
            },
            onChar: (char) => {
              this.caret.x = initialPosition.x + newLine.width;
            }
        });
      }
      else { this.dialogQueue.push(dialog) }
    }
  }
}


// Custom array class for managing dialogue lines
class Transcript extends Array {

  // The actual underlying array
  public baseArray: DialogLine[] = [];
  
  // When a new line is pushed, print it; tie-in the print callbacks to the config parameter
  override push(line: DialogLine, config?: {
    onEnd?: () => void,
    onStart?: () => void,
    onChar?: (char?: string) => void,
  }): number {

    // Add the new line to the end of the base array
    this.baseArray.push(line);
      
    // Print the new dialog line
    line.print(config?.onStart, config?.onEnd, config?.onChar);

    // update this length
    this.length = this.baseArray.length;
    return this.length;
  }
}

class Speaker { name: string; style: { color: string, stroke: string }; language: string };
