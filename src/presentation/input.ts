export class InputClosed extends Error {}

const stdin = Bun.stdin.stream();
const decoder = new TextDecoder();
let inputBuffer = "";

async function* readLines(): AsyncGenerator<string> {
  for await (const chunk of stdin) {
    inputBuffer += decoder.decode(chunk, { stream: true });
    let newline: number;
    while ((newline = inputBuffer.indexOf("\n")) !== -1) {
      const line = inputBuffer.slice(0, newline).replace(/\r$/, "");
      inputBuffer = inputBuffer.slice(newline + 1);
      yield line;
    }
  }
  if (inputBuffer) {
    const last = inputBuffer;
    inputBuffer = "";
    yield last;
  }
}

const lines = readLines();

export async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  const { value, done } = await lines.next();
  if (done) throw new InputClosed();
  return value.trim();
}
