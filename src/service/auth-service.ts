import { Model, UpdateWriteOpResult } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cloudinary } from '../config/cloudinary.js';
import * as types from '../types/index.js';
import { UserModel } from '../models/index.js';
import * as DTO from '../dtos/index.js';
import { CacheManager, logger } from '../utils/index.js';

export class AuthService {
  private readonly model: Model<types.IUser>;
  private cache: CacheManager<types.IUser>;

  constructor({ cache }: { cache: CacheManager<types.IUser> }) {
    this.model = UserModel;
    this.cache = cache;
  }

  private getToken(id: string) {
    return jwt.sign({ _id: id }, process.env.SECRET_TOKEN as string, {
      expiresIn: '30d',
    });
  }

  async create(body: DTO.CreatedUserDTO): Promise<types.IUser | types.IReturnErrorObj> {
    try {
      if (!body) {
        throw new Error('The new users data has not been received');
      }
      const { avatar } = body;

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

      const resImage = await cloudinary.uploader.upload(avatar, {
        folder: 'XPartners',
      });
      if (!resImage) {
        throw new Error('Failed create user img');
      }

      const updateImageUser = await this.model.findByIdAndUpdate(
        newUser._id,
        {
          avatar: { public_id: resImage.public_id, url: resImage.secure_url },
        },
        { returnDocument: 'after' },
      );
      if (!updateImageUser) throw new Error('Failed to update image in create new user');

      const token = this.getToken(updateImageUser._id);

      const { passwordHash, ...userData } = updateImageUser._doc;

      this.cache.addKeyInCache(userData._id.toString(), userData as types.IUser);

      return { ...userData, token } as types.IUser;
    } catch (error) {
      logger.error('Failed to create new user in service:', error);
      return { error, text: `Failed to ${error}` };
    }
  }

  async login(body: DTO.AuthorizationUserDTO): Promise<types.IUser | types.IReturnErrorObj> {
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

      return { ...userData, token } as types.IUser;
    } catch (error) {
      logger.error('Failed to login user in service:', error);
      return { error, text: `Failed to ${error}` };
    }
  }

  async getUser(userId: string): Promise<types.IUser | types.IReturnErrorObj> {
    try {
      if (!userId) {
        throw new Error('Failed to get user ID not found');
      }

      let getUserCache = this.cache.getValueInKey(userId);

      if (!getUserCache) {
        const user = await this.model.findById(userId);

        if (!user) {
          throw new Error('user undefined in db');
        }

        const { passwordHash, ...userData } = user._doc;

        getUserCache = userData as types.IUser;

        this.cache.addKeyInCache(userId, userData as types.IUser);
      }

      return getUserCache as types.IUser;
    } catch (error) {
      logger.error('Failed to get user in service:', error);
      return { error, text: 'Failed to get user in service' };
    }
  }

  async getAll(id: string): Promise<types.IUser[] | types.IReturnErrorObj> {
    try {
      if (!id) {
        throw new Error('Failed to get user ID not found');
      }

      const allUsers = await this.model.find({ _id: { $ne: id } }, { date_of_birth: 1, name: 1, avatar: 1 });

      if (!allUsers) {
        throw new Error('Failed to get all users');
      }

      return allUsers;
    } catch (error) {
      logger.error('Failed to get user in service:', error);
      return { error, text: 'Failed to get all users in service' };
    }
  }

  async removeUser(id: string): Promise<{ success: boolean; message: string } | types.IReturnErrorObj> {
    try {
      const idAuth = id;
      const auth = await this.model.findByIdAndDelete(idAuth);

      if (!auth) {
        throw new Error('Failed to get user id db');
      }

      this.cache.removeKeyFromCache(idAuth);

      const imageId = auth.avatar.public_id;
      await cloudinary.uploader.destroy(imageId);

      return { success: true, message: `${auth.name} user deleted` };
    } catch (error) {
      logger.error('Failed to remove user in service:', error);
      return { error, text: 'Failed to remove user in service' };
    }
  }

  async updateUser(body: DTO.UpdateUserDTO): Promise<types.IUser | types.IReturnErrorObj> {
    try {
      const { id, name, newImg, password, prevImg } = body;

      if (!id) {
        throw new Error('Failed to body data in update user service');
      }

      const payload: Record<string, string | { public_id: string; url: string }> = {};

      if (name) {
        payload.name = name;
      }

      if (password) {
        payload.password = password;
      }

      if (prevImg) {
        await cloudinary.uploader.destroy(prevImg);

        const result = await cloudinary.uploader.upload(newImg, {
          folder: 'XPartners',
          fetch_format: 'auto',
        });

        payload.avatar = { public_id: result.public_id, url: result.secure_url };
      }

      const updateUser = await this.model.findByIdAndUpdate(id, { ...payload }, { returnDocument: 'after' });
      if (!updateUser) throw new Error('Failed to update user');
      const { passwordHash, ...userData } = updateUser._doc;

      return userData as types.IUser;
    } catch (error) {
      logger.error('Failed to update user in service:', error);
      return { error, text: 'Failed to update user in service' };
    }
  }
}
