import { config } from 'dotenv';
config();

import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { hash } from 'bcrypt';
import { User } from './user.model';
import { UserService } from './user.service';
import { LocalStrategy } from 'src/auth/local.strategy';
import { JwtService } from '@nestjs/jwt';

@Resolver(of => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly localStrategy: LocalStrategy,
    private readonly jwtService: JwtService,
  ) {}

  @Query(returns => User, { name: 'user' })
  async getUserById(@Args('id', { type: () => Int }) id: number) {
    return {
      id: 4,
      email: 'hello@hello.com',
      username: 'abcd',
    };
  }

  @Mutation(returns => String)
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

    if (id) {
      return this.jwtService.sign(id);
    } else {
      return 'failed';
    }
  }

  @Query(returns => String)
  async login(
    @Args({ name: 'email', type: () => String }) email: string,
    @Args({ name: 'password', type: () => String }) password: string,
  ) {
    const result = await this.localStrategy.validate(email, password);
    console.log('result', result);
    if (result) {
      return this.jwtService.sign(result);
    } else {
      return 'failed';
    }
  }
}
