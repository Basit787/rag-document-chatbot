import { extname } from 'node:path';
import { OllamaEmbeddings } from '@langchain/ollama';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PDFParse } from 'pdf-parse';
import { config } from '../util/config.js';

export interface RetrievedChunk {
  filename: string;
  content: string;
  score: number;
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.md'];

const documentSelect = {
  id: true,
  filename: true,
  size: true,
  chunkCount: true,
  createdAt: true,
};

@Injectable()
export class DocumentsService {
  private readonly embeddings = new OllamaEmbeddings({
    baseUrl: config.ollamaBaseUrl,
    model: config.ollamaEmbedModel,
  });
  private readonly splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  constructor(private readonly prisma: PrismaClient) {}

  list(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: documentSelect,
    });
  }

  async upload(userId: string, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('file required');
    const extension = extname(file.originalname).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      throw new BadRequestException(
        'Only PDF, TXT and Markdown (.md) files are supported',
      );
    }

    const text = await this.extractText(file.buffer, extension);
    const chunks = await this.splitter.splitText(text);
    if (!chunks.length) {
      throw new BadRequestException('The file has no readable text');
    }

    const vectors = await this.embed(() =>
      this.embeddings.embedDocuments(chunks),
    );

    return this.prisma.document.create({
      data: {
        userId,
        filename: file.originalname,
        size: file.size,
        chunkCount: chunks.length,
        chunks: {
          create: chunks.map((content, index) => ({
            index,
            content,
            embedding: vectors[index],
          })),
        },
      },
      select: documentSelect,
    });
  }

  // Someone else's document answers 404, same as a missing one.
  async remove(userId: string, id: string) {
    const { count } = await this.prisma.document.deleteMany({
      where: { id, userId },
    });
    if (!count) throw new NotFoundException('Document not found');
  }

  // Top `limit` chunks of the user's documents by cosine similarity to the query.
  async search(
    userId: string,
    query: string,
    limit = 4,
  ): Promise<RetrievedChunk[]> {
    const chunks = await this.prisma.chunk.findMany({
      where: { document: { userId } },
      select: {
        content: true,
        embedding: true,
        document: { select: { filename: true } },
      },
    });
    if (!chunks.length) return [];

    const queryVector = await this.embed(() =>
      this.embeddings.embedQuery(query),
    );
    return chunks
      .map((chunk) => ({
        filename: chunk.document.filename,
        content: chunk.content,
        score: cosineSimilarity(queryVector, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async extractText(buffer: Buffer, extension: string) {
    if (extension !== '.pdf') return buffer.toString('utf8');
    const parser = new PDFParse({ data: buffer });
    try {
      return (await parser.getText()).text;
    } catch {
      throw new BadRequestException('Could not read the PDF');
    } finally {
      await parser.destroy();
    }
  }

  private async embed<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch {
      throw new ServiceUnavailableException(
        `Embedding failed: is the Ollama model "${config.ollamaEmbedModel}" pulled?`,
      );
    }
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}
