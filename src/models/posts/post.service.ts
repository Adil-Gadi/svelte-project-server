import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
      post.author = author.id;

      try {
        const result = await post.save();

        return {
          ok: true,
          value: result.id,
        };
      } catch (error) {
        console.log(error);
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

  async editPost(
    title: string,
    content: string,
    postId: string,
    userId: string,
  ) {
    try {
      const post = await this.postModel.findById(postId);

      if (post && this.isAuthor(userId, post)) {
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
    } catch (error) {}

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

  private async isAuthor(userId: string, post: Post): Promise<boolean> {
    if (post.author.toString() === userId) {
      console.log(true);
      return true;
    }

    return false;
  }

  async likePost(userId: string, postId: string): Promise<number> {
    const post = await this.postModel.findById(postId);

    const likesSet = new Set(post.likes);

    likesSet.add(userId);

    post.likes = [...likesSet];

    try {
      await post.save();

      return post.likes.length;
    } catch (error) {
      return -1;
    }
  }

  async unlikePost(userId: string, postId: string): Promise<number> {
    const post = await this.postModel.findById(postId);

    if (post) {
      post.likes = post.likes.filter(id => id !== userId);

      try {
        await post.save();
        return post.likes.length;
      } catch (error) {}
    }

    return -1;
  }

  async getLatestPosts(limit: number, step: number, since: number) {
    const posts = await this.postModel
      .find({
        createdAt: {
          $lt: new Date(since),
        },
      })
      .sort({ createdAt: -1 })
      .skip(step * limit)
      .limit(limit + 1);

    return posts;
  }

  async getPost(postId: string): Promise<any> {
    try {
      const post = await this.postModel.findById(postId);

      if (post) {
        return {
          ok: true,
          value: post,
        };
      }
    } catch (error) {}

    return {
      ok: false,
      value: 'Post not Found',
    };
  }
}
