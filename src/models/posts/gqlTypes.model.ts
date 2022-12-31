import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { Post } from './post.model';

export const GetPostResponse = createUnionType({
  name: 'GetPostResponse',
  types() {
    return [GetPostSuccess, GetPostError] as const;
  },
});

@ObjectType()
export class GetPostSuccess {
  @Field()
  ok: boolean;

  @Field()
  value: Post;
}

@ObjectType()
export class GetPostError {
  @Field()
  ok: boolean;

  @Field()
  value: string;
}

@ObjectType()
export class GetLatestPost {
  @Field(type => [Post])
  posts: Post[];

  @Field()
  next: boolean;
}
