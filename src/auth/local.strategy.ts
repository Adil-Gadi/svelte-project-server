import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from '../models/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super();
  }

  async validate(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);

    console.log('user', user);
    if (user) {
      const result = await compare(password, (await user).password);

      console.log(result);
      if (result) {
        return (await user).id;
      }
    }

    return false;
  }
}
