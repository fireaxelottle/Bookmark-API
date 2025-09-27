import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    // Password To Hash
    const hash = await argon.hash(dto.password);
    try {
        //Try Creating User
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      // Remove User Pasword
      const { hash: userHash, ...result } = user;
      // Return
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw new error();
    }
  }

  async login(dto: AuthDto) {
    // Find User
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // Check if User Exists
    if (!user) throw new ForbiddenException('Credentials Incorrect');

    // Check Password
    const pwMatches = await argon.verify(user.hash, dto.password);

    // Match Pasword
    if (!pwMatches) throw new ForbiddenException('Password Incorect');

    // Remove User Pasword
    const { hash: userHash, ...result } = user;
    // Return
    return result;
  }
}
