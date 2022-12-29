import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthenticationError {
  @Field()
  ok: boolean;

  @Field()
  value: string;
}
