import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { User, UserDocument } from '@users/user.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createPost(title: string, content: string, authorId: string) {
    const post = new this.postModel({
      title,
      content,
      likes: [],
      edited: false,
      authorId,
    });

    const author = await this.findAuthor(authorId);

    if (author) {
      post.author = author;

      try {
        const result = await post.save();

        return {
          ok: true,
          value: result.id,
        };
      } catch (error) {
        return {
          ok: false,
          value: '',
        };
      }
    } else {
      return {
        ok: false,
        value: 'User does not exist',
      };
    }
  }

  async editPost(title: string, content: string, postId: string) {
    const post = await this.postModel.findById(postId);

    if (post) {
      post.title = title;
      post.content = content;
      post.edited = true;

      try {
        await post.save();

        return { ok: true, value: '' };
      } catch (error) {
        return { ok: false, value: '' };
      }
    }

    return { ok: false, value: '' };
  }

  private async findAuthor(id: string) {
    const result = await this.userModel.findById(id);

    if (result) {
      return result;
    } else {
      return;
    }
  }

  async isAuthor(userId: string, postId: string): Promise<boolean> {
    const result = await this.postModel.findById(postId);

    if (result) {
      if (result.authorId.toString() === userId) {
        return true;
      }
    }

    return false;
  }

  async likePost(userId: string, postId: string): Promise<boolean> {
    const post = await this.postModel.findById(postId);

    const likesSet = new Set(post.likes);

    likesSet.add(userId);

    post.likes = [...likesSet];

    try {
      await post.save();

      return true;
    } catch (error) {
      return false;
    }
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const post = await this.postModel.findById(postId);

    if (post) {
      post.likes.filter(id => id !== userId);

      try {
        await post.update();
        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  }
}
