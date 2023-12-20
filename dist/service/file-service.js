import fs from 'fs';
import path from 'path';
export class FileService {
    uploadFile({ file, pathDir = 'uploads', fileName }) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.resolve(`./${pathDir}`, fileName), file, (err) => {
                if (err) {
                    return reject({ result: 'error', message: err.message, data: null });
                }
                resolve({ result: 'success', message: fileName, data: null });
            });
        });
    }
    appendFile({ file, pathDir = 'uploads', fileName }) {
        return new Promise((resolve, reject) => {
            fs.appendFile(path.resolve(`./${pathDir}`, fileName), file, (err) => {
                if (err) {
                    return reject({ result: 'error', message: err.message, data: null });
                }
                resolve({ result: 'success', message: fileName, data: null });
            });
        });
    }
    async readFile({ path }) {
        return new Promise((resolve, reject) => fs.readFile(path, { encoding: 'utf-8' }, (err, data) => {
            if (err) {
                return reject({ result: 'error', message: err.message, data: null });
            }
            resolve(data);
        }));
    }
    async removeFile({ path }) {
        return new Promise((resolve, reject) => fs.rm(path, (err) => {
            if (err) {
                return reject({ result: 'error', message: err.message, data: null });
            }
            resolve({ result: 'success', message: `remove file: ${path}`, data: null });
        }));
    }
}
