import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/index.js';
import { logger } from '../utils/index.js';
import { uploadController } from '../controllers/api-upload-controllers.js';
export class AuthService {
    constructor() {
        this.model = UserModel;
    }
    getToken(id) {
        return jwt.sign({ _id: id }, process.env.SECRET_TOKEN, {
            expiresIn: '30d',
        });
    }
    async create({ body, fileImage }) {
        var _a;
        try {
            if (!body) {
                throw new Error('The new users data has not been received');
            }
            const pas = body.password;
            const salt = await bcrypt.genSalt(10);
            const passwordBcrypt = await bcrypt.hash(pas, salt);
            const newUser = await new this.model({
                ...body,
                passwordHash: passwordBcrypt,
            }).save();
            if (!newUser) {
                throw new Error('Failed to create new user');
            }
            const uploadImg = await uploadController.createImage({ dir: 'avatar', file: fileImage, h: 150, w: 150 });
            const imgUrl = (_a = uploadImg.data) === null || _a === void 0 ? void 0 : _a.url;
            if (!imgUrl || uploadImg.result !== 'success') {
                throw new Error('Failed create user img');
            }
            const updateImageUser = await this.model.findByIdAndUpdate(newUser._id, { avatar: imgUrl }, { returnDocument: 'after' });
            if (!updateImageUser)
                throw new Error('Failed to update image in create new user');
            const token = this.getToken(updateImageUser._id);
            const { passwordHash, ...userData } = updateImageUser._doc;
            return { ...userData, token };
        }
        catch (error) {
            logger.error('Failed to create new user in service:', error);
            return { error, text: `Failed to ${error}` };
        }
    }
    async login(body) {
        try {
            const { email, password } = body;
            if (!email) {
                throw new Error('Failed to email undefined');
            }
            const user = await this.model.findOne({ email: email });
            if (!user) {
                throw new Error('Failed to email or password');
            }
            const isValidPass = user._doc.passwordHash && bcrypt.compare(password, user._doc.passwordHash);
            if (!isValidPass) {
                throw new Error('Failed to email or password');
            }
            const token = this.getToken(user._id);
            const { passwordHash, ...userData } = user._doc;
            return { ...userData, token };
        }
        catch (error) {
            logger.error('Failed to login user in service:', error);
            return { error, text: `Failed to ${error}` };
        }
    }
    async getUser(userId) {
        try {
            if (!userId) {
                throw new Error('Failed to get user ID not found');
            }
            const user = await this.model.findById(userId);
            if (!user) {
                throw new Error('user undefined in db');
            }
            const { passwordHash, ...userData } = user._doc;
            return userData;
        }
        catch (error) {
            logger.error('Failed to get user in service:', error);
            return { error, text: 'Failed to get user in service' };
        }
    }
    async getAll(id) {
        try {
            if (!id) {
                throw new Error('Failed to get user ID not found');
            }
            const allUsers = await this.model.find({ _id: { $ne: id } }, { date_of_birth: 1, name: 1, avatar: 1 });
            if (!allUsers) {
                throw new Error('Failed to get all users');
            }
            return allUsers;
        }
        catch (error) {
            logger.error('Failed to get user in service:', error);
            return { error, text: 'Failed to get all users in service' };
        }
    }
    async removeUser(id) {
        try {
            const idAuth = id;
            const auth = await this.model.findByIdAndDelete(idAuth);
            if (!auth) {
                throw new Error('Failed to get user id db');
            }
            return { success: true, message: `user deleted` };
        }
        catch (error) {
            logger.error('Failed to remove user in service:', error);
            return { error, text: 'Failed to remove user in service' };
        }
    }
    async updateUser({ body, fileImage }) {
        var _a;
        try {
            const { id, name, password, prevImg } = body;
            if (!id) {
                throw new Error('Failed to body data in update user service');
            }
            const payload = {};
            if (name) {
                payload.name = name;
            }
            if (password) {
                payload.password = password;
            }
            if (fileImage && prevImg) {
                const uploadImg = await uploadController.changeImage({ path: prevImg, dir: 'avatar', file: fileImage, h: '150', w: '150' });
                const newImgUrl = (_a = uploadImg.data) === null || _a === void 0 ? void 0 : _a.url;
                payload.avatar = newImgUrl;
            }
            const updateUser = await this.model.findByIdAndUpdate(id, { ...payload }, { returnDocument: 'after' });
            if (!updateUser)
                throw new Error('Failed to update user');
            const { passwordHash, ...userData } = updateUser._doc;
            return userData;
        }
        catch (error) {
            logger.error('Failed to update user in service:', error);
            return { error, text: 'Failed to update user in service' };
        }
    }
}
