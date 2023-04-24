export default class DialogueDisplay {
  private readonly dialogueList: string[] = [];
  public textList = document.getElementById('text-lines') as HTMLUListElement;

  // Creates a new TextLine and add it to the text list
  public addText(t: string): void {
    const textLine = new TextLine(this.dialogueList.length, t);
    this.dialogueList.push(t);
    this.textList.appendChild(textLine.el);
    textLine.el.scrollIntoView();
  }
}

export class TextLine {
  public el: HTMLLIElement;
  private textLine: string;
  private readonly idMult = 0.0001;

  constructor(idNum: number, text: string) {
    console.debug(`-- Module Loaded: Dialogue Display --`);

    // Set the ID number
    let id = this.idMult*idNum;
    let idString = id.toFixed(4).toString().split('.')[1];
    
    // Create the element
    this.el = document.createElement('li') as HTMLLIElement;
    this.el.className = id % 2 === 0 ? 'cyan' : 'orange';
    
    // Set the text to type and add the prefix
    this.textLine = text;
    this.el.textContent = `▌${idString}▐▪▪ `;

    // Start typing
    this.textLine.split('').forEach((character, n) => { 
      setTimeout(() => {
        this.el.textContent += character;

        // return true when finished typing
        if (n === text.length - 1) return true;
      }, 60 * n);
    });
  }
}
