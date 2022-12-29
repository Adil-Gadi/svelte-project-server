import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Post {
  @Field(type => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  edited: boolean;

  @Field()
  createdAt: string;

  @Field()
  author: string;

  @Field()
  isAuthor: boolean;

  @Field(type => Int)
  likes: number;

  @Field()
  hasLikes: boolean;
}
