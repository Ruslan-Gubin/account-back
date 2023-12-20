import sharp from 'sharp';
export class CompressionService {
    async compressImage({ buffer, width, height }) {
        const imgW = width ? width : 300;
        const imgH = height ? height : 300;
        try {
            return await sharp(buffer)
                .resize(Number(imgW), Number(imgH))
                .jpeg({ mozjpeg: true, quality: 80 })
                .sharpen()
                .normalize()
                .webp()
                .toBuffer();
        }
        catch (error) {
            throw new Error(`Failed to compress image: ${error}`);
        }
    }
    async getResizeImage({ buffer, width, height, blur, rotate, linear, modulate, border }) {
        const imgW = width ? width : 100;
        const imgH = height ? height : 100;
        const blurValue = blur ? blur : false;
        const rotateValue = rotate ? rotate : 0;
        const [linearBrightness, linearSaturation] = linear ? linear : [1, 1];
        const [modulateBrightness, modulateSaturation] = modulate ? modulate : [1, 1];
        const borderValue = border ? border : {};
        try {
            sharp({ animated: true });
            return await sharp(buffer)
                .resize(Number(imgW), Number(imgH))
                .jpeg({ quality: 80 })
                .rotate(rotateValue)
                .blur(blurValue)
                .modulate({ brightness: modulateBrightness, saturation: modulateSaturation })
                .linear(linearBrightness, linearSaturation)
                .sharpen()
                .extend(borderValue)
                .normalize({ lower: 1 })
                .webp()
                .toBuffer({ resolveWithObject: false });
        }
        catch (error) {
            throw new Error(`Failed to compress image: ${error}`);
        }
    }
}
export const compressionService = new CompressionService();
