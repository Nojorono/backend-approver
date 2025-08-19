import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPinDto {
  @ApiProperty({
    description: 'New PIN code to set',
    example: '123456',
    minLength: 4,
    maxLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 8, { message: 'PIN must be between 4 and 8 characters' })
  pin: string;
}
