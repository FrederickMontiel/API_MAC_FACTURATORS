import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  platform: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  jwt: string;
}
