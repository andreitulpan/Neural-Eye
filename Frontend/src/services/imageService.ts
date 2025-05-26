
import { api } from "./api";

export interface ImageRecord {
  id: number;
  imageData: Uint8Array | ArrayBuffer | number[] | string | any; // varbinary can come in various formats
  extractedText: string;
  user_id: string;
}

export const imageService = {
  /**
   * Get all images and extracted text for a specific user
   */
  async getUserImages(userId: string): Promise<ImageRecord[]> {
    return api.get<ImageRecord[]>(`/api/stream/getimages/${userId}`);
  }
};
