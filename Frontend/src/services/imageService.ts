
import { api } from "./api";

export interface ImageRecord {
  id: number;
  imageData: string;
  extractedText: string;
  user_id: number;
}

export const imageService = {
  /**
   * Get all images and extracted text for a specific user
   */
  async getUserImages(userId: string): Promise<ImageRecord[]> {
    return api.get<ImageRecord[]>(`/api/stream/getimages/${userId}`);
  }
};
