class OpenAI {
    FORMAT = 'http://localhost:3000/api/format';
    PROMPT = 'http://localhost:3000/api/prompt';
    DIARIZE = 'http://localhost:3000/api/diarize';
    constructor() { }
    async formatInput(input) {
        const response = await fetch(`${this.FORMAT}?t=${input}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'text/data-stream; application/json',
            },
        });
        return response.text();
    }
}
export default OpenAI;
//# sourceMappingURL=OpenAI.js.map