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
    const user = this.userService.findUserByEmail(email);

    if (user) {
      const result = compare(password, (await user).password);

      if (result) {
        return (await user).id;
      }
    }

    return false;
  }
}
