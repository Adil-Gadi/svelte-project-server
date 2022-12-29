import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    email: string,
    username: string,
    password: string,
  ): Promise<{ ok: boolean; value: string }> {
    const createdUser = new this.userModel();
    createdUser.email = email;
    createdUser.username = username;
    createdUser.password = password;
    try {
      const res = await createdUser.save();
      return {
        ok: true,
        value: res.id,
      };
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern.email === 1) {
          return { ok: false, value: 'Email is already taken.' };
        }

        if (error.keyPattern.username === 1) {
          return { ok: false, value: 'Username is already taken.' };
        }
      }
      return { ok: false, value: '' };
    }
  }

  async findUserByEmail(email: string) {
    const user = this.userModel.findOne({ email });

    if (user) {
      return user;
    } else return undefined;
  }
}

