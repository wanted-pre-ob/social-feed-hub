import { Body, Controller, HttpCode, HttpStatus, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/decorator/is-public.decorator';

interface UserRequest extends Request {
  user: UserResponseDto;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Public()
  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    await this.usersService.create({
      name: createUserDto.name,
      accountName: createUserDto.accountName,
      email: createUserDto.email,
      password: createUserDto.password,
    });
    const user = await this.usersService.getOneByEmailOrFail(createUserDto.email);

    return this.authService.login({ id: user.id, name: user.name, accountName: user.accountName, email: user.email });
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('/sign-in')
  async signIn(@Request() req: UserRequest): Promise<{ access_token: string }> {
    return this.authService.login(req.user);
  }

  @Patch('/verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Request() req: UserRequest, @Body('code') code: string) {
    await this.usersService.verifyEmailCode(code, req.user);
  }
}
