import { config } from 'dotenv';
config();

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { hash } from 'bcrypt';
import { User } from './user.model';
import { AuthenticationError } from './authenticationError.model';
import { UserService } from './user.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, GqlAuthGuard } from '@auth/jwt.guard';
import {
  GetUserError,
  GetUserResponse,
  GetUserSuccess,
} from './getUserError.model';

@Resolver(of => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly jwtStrategy: JwtStrategy,
    private readonly jwtService: JwtService,
  ) {}

  @Query(returns => GetUserResponse)
  @UseGuards(GqlAuthGuard)
  async getUser(
    @CurrentUser() userId: string,
    @Args('id', { type: () => String }) id: string,
  ) {
    const result = await this.userService.findUserById(id);

    if (result.ok) {
      const { value: user } = result;

      const success = new GetUserSuccess();
      success.ok = true;
      success.value = {
        id: user.id,
        email: id === userId ? user.email : '',
        username: user.username,
      };
      return success;
    }

    const error = new GetUserError();
    error.ok = false;
    error.value = 'User Not Found';
    return error;
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
      return { ok: true, value: this.jwtService.sign(id.value) };
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
