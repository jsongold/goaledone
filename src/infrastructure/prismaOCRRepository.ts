import { PrismaClient } from '@prisma/client';
import { OCRResult, OCRRepository } from '../domain/ocr';
// Import your OCR service here if needed

const prisma = new PrismaClient();

export class PrismaOCRRepository implements OCRRepository {
  async processImage(imageData: string): Promise<OCRResult> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User must be authenticated to process images');
    }

    // Call your OCR service here
    // This is a placeholder for the actual OCR processing
    const extractedText = "Sample extracted text"; // Replace with actual OCR result
    
    const result: OCRResult = {
      id: crypto.randomUUID(),
      userId: userId,
      timestamp: new Date(),
      imageData: imageData,
      extractedText: extractedText,
      confidence: 0.95, // Example confidence score
    };

    // Save the result to the database
    await prisma.ocrResult.create({
      data: {
        id: result.id,
        userId: result.userId,
        timestamp: result.timestamp,
        imageData: result.imageData,
        extractedText: result.extractedText,
        confidence: result.confidence,
      }
    });

    return result;
  }

  async getHistory(): Promise<OCRResult[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.error('No authenticated user found');
      return [];
    }

    const results = await prisma.ocrResult.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      timestamp: result.timestamp,
      imageData: result.imageData,
      extractedText: result.extractedText,
      confidence: result.confidence,
    }));
  }

  async delete(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User must be authenticated to delete OCR results');
    }

    await prisma.ocrResult.delete({
      where: {
        id: id,
        userId: userId,
      },
    });
  }

  // Helper method to get current user ID
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          // Add your authentication condition here
        }
      });
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
} 