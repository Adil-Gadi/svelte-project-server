import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

export const GetUserResponse = createUnionType({
  name: 'GetUserResponse',
  types: () => [GetUserSuccess, GetUserError] as const,
});

@ObjectType()
export class GetUserSuccess {
  @Field()
  ok: boolean;

  @Field()
  value: User;
}

@ObjectType()
export class GetUserError {
  @Field()
  ok: boolean;

  @Field()
  value: string;
}
