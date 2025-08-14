import { ApiProperty } from '@nestjs/swagger';

export class UserMenuDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  icon?: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: [UserMenuDto] })
  children?: UserMenuDto[];
}
