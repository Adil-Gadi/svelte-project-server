import { config } from 'dotenv';
config();

import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { hash } from 'bcrypt';
import { User } from './user.model';
import { AuthenticationError } from './authenticationError.model';
import { UserService } from './user.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { JwtService } from '@nestjs/jwt';

@Resolver(of => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly jwtStrategy: JwtStrategy,
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

  @Mutation(returns => AuthenticationError)
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

    if (id.ok) {
      return { ok: true, value: this.jwtService.sign(id) };
    } else {
      return { ok: false, value: id.value };
    }
  }

  @Query(returns => AuthenticationError)
  async login(
    @Args({ name: 'email', type: () => String }) email: string,
    @Args({ name: 'password', type: () => String }) password: string,
  ) {
    const result = await this.jwtStrategy.login(email, password);
    return {
      ok: result.ok,
      value: result.value,
    };
  }
}
