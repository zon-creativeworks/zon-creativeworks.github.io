declare class OpenAI {
    private readonly FORMAT;
    private readonly PROMPT;
    private readonly DIARIZE;
    constructor();
    formatInput(input: string): Promise<string>;
}
export default OpenAI;
