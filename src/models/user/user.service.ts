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
  ): Promise<string> {
    const createdUser = new this.userModel();
    createdUser.email = email;
    createdUser.username = username;
    createdUser.password = password;
    try {
      const res = await createdUser.save();
      return res.id;
    } catch (error) {
      console.dir(error);
      return 'error';
    }
  }

  async findUserByEmail(email: string) {
    const user = this.userModel.findOne({ email });

    if (user) {
      return user;
    } else return undefined;
  }
}

