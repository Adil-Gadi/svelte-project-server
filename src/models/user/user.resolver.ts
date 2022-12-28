import { config } from 'dotenv';
config();

import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { hash } from 'bcrypt';
import { User } from './user.model';
import { UserService } from './user.service';
import { LocalStrategy } from 'src/auth/local.strategy';
import { JwtService } from '@nestjs/jwt';

@Resolver((of) => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly localStrategy: LocalStrategy,
    private readonly jwtService: JwtService,
  ) {}

  @Query((returns) => User, { name: 'user' })
  async getUser(@Args('id', { type: () => Int }) id: number) {
    return {
      id: 4,
      email: 'hello@hello.com',
      username: 'abcd',
      password: 'hashed',
    };
  }

  @Mutation((returns) => String)
  async signUp(
    @Args({ name: 'email', type: () => String }) email: string,
    @Args({ name: 'password', type: () => String }) password: string,
    @Args({ name: 'username', type: () => String }) username: string,
  ) {
    const hashedPassword = await hash(password, 10);

    const id = await this.userService.createUser(
      email,
      username,
      hashedPassword,
    );
    return id;
  }

  @Query((returns) => String)
  async login(
    @Args({ name: 'email', type: () => String }) email: string,
    @Args({ name: 'password', type: () => String }) password: string,
  ) {
    const result = await this.localStrategy.validate(email, password);
    if (result) {
      return this.jwtService.sign('hello');
    } else {
      return '';
    }
  }
}
