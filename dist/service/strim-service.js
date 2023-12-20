import fs from 'fs';
import path from 'path';
import { logger } from '../utils/loger.js';
import { compressionService } from './compression-service.js';
import { CacheManager, getQueryRequest } from '../utils/index.js';
export class StrimService {
    constructor() {
        this.cache = new CacheManager(30);
    }
    async writeStrim({ file, pathDir, fileName }) {
        try {
            const uuid = this.getUnicId();
            const unicPath = `${pathDir}/${uuid}-${fileName}`;
            return new Promise((resolve, reject) => {
                const writableStream = fs.createWriteStream(unicPath);
                writableStream.write(file);
                writableStream.end(() => {
                    resolve(unicPath);
                });
                writableStream.on('error', (e) => {
                    console.warn(e);
                    reject(new Error('Failed write file'));
                });
            });
        }
        catch (error) {
            logger.error('Failed write file:', error);
            throw new Error(`Failed write file:: ${error}`);
        }
    }
    getUnicId() {
        return crypto.randomUUID();
    }
    async getFoto(req, res) {
        if (!req.url)
            return;
        const { pathName, query } = getQueryRequest(req.url);
        const pathFile = path.resolve(`./${pathName}`);
        try {
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Content-Type', 'image/jpeg');
            const readStream = fs.createReadStream(pathFile);
            if (Object.keys(query).length !== 0) {
                const { w, h, blur, rotate, linear, modulate, border } = query;
                let cacheBuffer = this.cache.getValueInKey(req.url);
                if (cacheBuffer) {
                    res.statusCode = 200;
                    res.end(cacheBuffer);
                    return;
                }
                const linerParams = linear ? Array.from(linear.split(',')).map(value => Number(value)) : [];
                const modulateParams = modulate ? Array.from(modulate.split(',')).map(value => Number(value)) : [];
                const borderParams = border ? Array.from(border.split(',')) : [];
                const borderColor = border ? borderParams[1] : 'black';
                const borderSize = border ? Number(borderParams[0]) : 0;
                let fileData = Buffer.alloc(0);
                readStream.on('data', (chunk) => {
                    if (chunk) {
                        fileData = Buffer.concat([fileData, Buffer.from(chunk)]);
                    }
                });
                readStream.on('end', async () => {
                    try {
                        const processedData = await compressionService.getResizeImage({
                            buffer: fileData,
                            width: Number(w),
                            height: Number(h),
                            blur: Number(blur),
                            rotate: Number(rotate),
                            linear: linerParams,
                            modulate: modulateParams,
                            border: { top: borderSize, bottom: borderSize, left: borderSize, right: borderSize, background: borderColor },
                        });
                        if (!processedData) {
                            res.statusCode = 500;
                            res.end('File not found');
                        }
                        else {
                            res.end(processedData);
                            if (req.url) {
                                this.cache.addKeyInCache(req.url, processedData);
                            }
                        }
                    }
                    catch (error) {
                        logger.error('Error processing image:', error);
                        res.statusCode = 500;
                        res.end('Error processing image');
                    }
                });
            }
            else {
                try {
                    readStream.pipe(res);
                }
                catch (error) {
                    res.statusCode = 404;
                    res.end('File no read');
                }
            }
            readStream.addListener('error', () => {
                res.statusCode = 404;
                res.end('File not found');
            });
        }
        catch (error) {
            logger.error('Failed get file', error);
            res.statusCode = 500;
            res.end(error);
            throw new Error('Failed get file');
        }
    }
}
export const strimService = new StrimService();
