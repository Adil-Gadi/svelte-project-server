import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostError {
  @Field()
  ok: boolean;

  @Field()
  value: string;
}
