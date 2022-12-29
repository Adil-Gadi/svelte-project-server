import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from '../models/users/user.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticationError {
  ok: boolean;
  value: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return payload;
  }

  async login(email: string, password: string): Promise<AuthenticationError> {
    const user = await this.userService.findUserByEmail(email);

    if (user) {
      const result = await compare(password, (await user).password);

      if (result) {
        return {
          value: await this.jwtService.sign((await user).id),
          ok: true,
        };
      }
    }

    return {
      ok: false,
      value: 'Credentials are Invalid',
    };
  }
}
