export async function* readServerSentEvents<T>(
  stream: ReadableStream<BufferSource>,
): AsyncGenerator<T> {
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += value;
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';

      for (const block of blocks) {
        const event = parseBlock<T>(block);
        if (event !== undefined) yield event;
      }
    }

    const last = parseBlock<T>(buffer);
    if (last !== undefined) yield last;
  } finally {
    reader.releaseLock();
  }
}

function parseBlock<T>(block: string): T | undefined {
  const data = block
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');
  return data ? (JSON.parse(data) as T) : undefined;
}
