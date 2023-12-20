import { logger } from '../utils/loger.js';
import { UploadService } from '../service/upload-service.js';
export class UploadController {
    constructor() {
        this.createImage = async (body) => {
            try {
                return await this.service.createImage(body);
            }
            catch (error) {
                logger.error('Failed to create image:', error);
                return { result: 'error', message: `${error}`, data: null };
            }
        };
        this.removeImage = async (payload) => {
            try {
                return await this.service.removeImage(payload);
            }
            catch (error) {
                logger.error('Failed to remove image:', error);
                throw error;
            }
        };
        this.changeImage = async (payload) => {
            try {
                return await this.service.changeImage(payload);
            }
            catch (error) {
                logger.error('Failed to remove image:', error);
                throw error;
            }
        };
        this.service = new UploadService();
    }
}
export const uploadController = new UploadController();
