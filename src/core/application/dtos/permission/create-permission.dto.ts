import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PermissionDto {
  @ApiProperty({ description: 'ID of the menu' })
  @IsNotEmpty()
  @IsString()
  menu_id: string;

  @ApiProperty({
    description: 'Type of permission (View, Create, Update, Delete)',
  })
  @IsNotEmpty()
  @IsString()
  action: string;
}
