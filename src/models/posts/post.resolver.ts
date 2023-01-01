import { config } from 'dotenv';
config();

import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Post } from './post.model';
import { PostService } from './post.service';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, GqlAuthGuard } from '@auth/jwt.guard';
import { PostError } from './postError.model';
import { GetLatestPost, GetPostSuccess } from './gqlTypes.model';

@Resolver(of => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(returns => PostError)
  @UseGuards(GqlAuthGuard)
  async createPost(
    @CurrentUser() userId: string,
    @Args({ name: 'title', type: () => String }) title: string,
    @Args({ name: 'content', type: () => String }) content: string,
  ) {
    const result = await this.postService.createPost(title, content, userId);

    return { ok: result.ok, value: result.value };
  }

  @Mutation(returns => PostError)
  @UseGuards(GqlAuthGuard)
  async editPost(
    @CurrentUser() userId: string,
    @Args({ name: 'title', type: () => String }) title: string,
    @Args({ name: 'content', type: () => String }) content: string,
    @Args({ name: 'postId', type: () => String }) postId: string,
  ) {
    const result = await this.postService.editPost(
      title,
      content,
      postId,
      userId,
    );

    if (result.ok) {
      return { ok: true, value: '' };
    }

    return { ok: false, value: '' };
  }

  @Mutation(returns => Boolean)
  @UseGuards(GqlAuthGuard)
  async deletePost(
    @CurrentUser() userId: string,
    @Args({ name: 'postId', type: () => String }) postId: string,
  ) {
    return await this.postService.deletePost(postId, userId);
  }

  @Mutation(returns => Int)
  @UseGuards(GqlAuthGuard)
  async likePost(
    @CurrentUser() userId: string,
    @Args({ name: 'postId', type: () => String }) postId: string,
  ) {
    return await this.postService.likePost(userId, postId);
  }

  @Mutation(returns => Int)
  @UseGuards(GqlAuthGuard)
  async unlikePost(
    @CurrentUser() userId: string,
    @Args({ name: 'postId', type: () => String }) postId: string,
  ) {
    return await this.postService.unlikePost(userId, postId);
  }

  @Query(returns => GetLatestPost, { name: 'getLatestPosts' })
  @UseGuards(GqlAuthGuard)
  async getLatestPosts(
    @CurrentUser() userId: string,
    @Args({ name: 'items', type: () => Int }) items: number,
    @Args({ name: 'step', type: () => Int }) step: number,
    @Args({ name: 'since', type: () => String }) since: string,
  ): Promise<GetLatestPost> {
    const latestPosts = await this.postService.getLatestPosts(
      items,
      step,
      Number(since),
    );

    const posts = await Promise.all(
      latestPosts.map(async post => {
        const isAuthor = userId === post.author.toString();

        await post.populate('author');

        return {
          id: post.id.toString(),
          title: post.title,
          content: post.content,
          edited: post.edited,
          createdAt: new Intl.DateTimeFormat('en-us', {
            dateStyle: 'short',
          }).format(),
          author: post.author.username,
          isAuthor,
          likes: post.likes.length,
          hasLiked: post.likes.includes(userId),
        };
      }),
    );

    const next = latestPosts.length > items;

    if (next) {
      posts.pop();
    }

    return {
      next,
      posts,
    };
  }

  @Query(returns => GetPostSuccess)
  @UseGuards(GqlAuthGuard)
  async getPost(
    @CurrentUser() userId: string,
    @Args({ name: 'postId', type: () => String }) postId: string,
  ) {
    const { ok, value: post } = await this.postService.getPost(postId);
    if (ok) {
      const isAuthor = userId === post.author.toString();

      await post.populate('author');

      return {
        ok: true,
        value: {
          id: post.id.toString(),
          title: post.title,
          content: post.content,
          edited: post.edited,
          createdAt: new Intl.DateTimeFormat('en-us', {
            dateStyle: 'short',
          }).format(),
          author: post.author.username,
          isAuthor,
          likes: post.likes.length,
          hasLiked: post.likes.includes(userId),
        },
      };
    }

    return {
      ok: false,
      value: '',
    };
  }
}
