import { Document } from '../Document/index.js';

export interface IUser extends Document {
  avatar: { public_id: string; url: string };
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  passwordHash?: string;
  token: string;
  gender: string;
  date_of_birth: string;
  _doc: IUser;
}
