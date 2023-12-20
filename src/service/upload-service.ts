import { CreateImageInput, CreateImageRespose, FileImage } from '../dtos/uploads-dto.js';
import { ErrorResponse } from '../types/index.js';
import { logger } from '../utils/index.js';
import { CompressionService } from './compression-service.js';
import { DirService } from './dir-service.js';
import { FileService } from './file-service.js';
import { StrimService } from './strim-service.js';

export class UploadService {
  private fileService: FileService;
  private dirService: DirService;
  private strimService: StrimService;
  private compression: CompressionService;

  constructor() {
    this.fileService = new FileService();
    this.dirService = new DirService();
    this.strimService = new StrimService();
    this.compression = new CompressionService()
  }

  async createImage(body: CreateImageInput): Promise<CreateImageRespose | ErrorResponse> {
    try {
      const { file, h, w, dir } = body;

      if (!file) {
        throw 'Failed to file in createImage service';
      }

      const fileName = file.originalname
      const imageRegex = /\.(jpg|jpeg|png|gif|tiff|avif|webp)$/i;

      if (!imageRegex.test(fileName)) {
        throw 'Image must be one of the following: jpg jpeg png gif ';
      }

      const pathDir = `uploads/${dir}`;

      const isNotEmptyDir = await this.checkDir(pathDir);

      if (!isNotEmptyDir) {
        throw 'Failed to dir service in createVideo';
      }

      const data = file.buffer.data
      const buffer = Buffer.from(data);

      const compress = await this.compression.compressImage({ buffer, height: h, width: w });

      const pathImage = await this.strimService.writeStrim({ file: compress, pathDir, fileName });

      return {
        data: { url: pathImage, path: pathImage },
        result: 'success',
        message: 'Image was successfully saved on the server',
      };
    } catch (error) {
      logger.error('Failed to create new image in service:', error);
      throw error;
    }
  }

  async removeImage(payload: {
    path: string;
  }): Promise<{ data: { path: string } | null; message: string; result: string }> {
    try {
      const isNotEmtyFile = this.dirService.checkFileExists(payload.path);

      if (!isNotEmtyFile) {
        return { result: 'error', message: `Empty : ${payload.path}`, data: null };
      }

      return await this.fileService.removeFile({ path: payload.path });
    } catch (error) {
      logger.error('Remove image:', error);
      throw error;
    }
  }

  async changeImage(payload: { path: string;dir: string; file: FileImage; w?: string, h?: string }): Promise<{ data: { path: string } | null; message: string; result: string }> {
    try {
      const { dir, file, path, w, h } = payload;

      if (!dir || !file || !path) {
        return { result: 'error', message: `Failed empty dir or file or path`, data: null };
      }
      
      const changeImage = await this.createImage({ dir, file, h: Number(h), w: Number(w) });

      if (changeImage.result !== 'success') {
        return { result: 'error', message: `Failed add change image`, data: null };
      }

      const removeImage = await this.removeImage({ path });

      if (removeImage.result !== 'success' && changeImage.data) {  
        await this.removeImage({ path: changeImage.data.path })
        return { result: 'error', message: `Failed remove old image`, data: null };
      }

      return { result: 'success', message: `Success Change image`, data: changeImage.data };
    } catch (error) {
      logger.error('Remove image:', error);
      throw error;
    }
  }

  async checkDir(pathDir: string) {
    try {
      return new Promise(async (resolve) => {
        const checkDir = this.dirService.checkFileExists(pathDir);

        if (!checkDir) {
          const createdir = await this.dirService.createDir(pathDir);
          resolve(createdir);
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      logger.error('Failed to check dir or create dir', error);
      throw error;
    }
  }
}
