import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Post {
  @Field()
  id: string;

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
  hasLiked: boolean;
}
