/* 
 * Calls the various serverless functions in the web service
 */

class OpenAI {
  private readonly FORMAT = 'http://localhost:3000/api/format';
  private readonly PROMPT = 'http://localhost:3000/api/prompt';
  private readonly DIARIZE = 'http://localhost:3000/api/diarize';

  constructor() {}

  public async formatInput(input: string): Promise<string> {
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