import { logger } from '../utils/loger.js';
import { ErrorResponse } from '../types/ErrorResponse.js';
import { ChangeImageInput, CreateImageInput, CreateImageRespose } from '../dtos/uploads-dto.js';
import { UploadService } from '../service/upload-service.js';


export class UploadController {
  private service: UploadService;

  constructor() {
    this.service = new UploadService();
  }

  /** Создание изображения */
   createImage = async (body: CreateImageInput): Promise<CreateImageRespose | ErrorResponse> => {
    try {
      return await this.service.createImage(body);
    } catch (error) {
      logger.error('Failed to create image:', error);
      return { result: 'error', message: `${error}`, data: null };
    }
  };

  /** Удаление изображения */
   removeImage = async (payload: { path: string }): Promise<any> => {
    try {
      return await this.service.removeImage(payload);
    } catch (error) {
      logger.error('Failed to remove image:', error);
      throw error;
    }
  };

  /** Замена изображения */
   changeImage = async (payload: ChangeImageInput): Promise<any> => {
    try {
      return await this.service.changeImage(payload); 
    } catch (error) {
      logger.error('Failed to remove image:', error);
      throw error;
    }
  };
}


export const uploadController = new UploadController()
