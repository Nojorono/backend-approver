import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    username: string;
    phone: string;
    email: string;
    pin: string;
    roles: string[];
  };
}
