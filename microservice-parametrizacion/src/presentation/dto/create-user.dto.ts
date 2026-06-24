import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Miguel',
    description: 'Nombre del usuario',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'miguel@empresa.com',
    description: 'Email institucional',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID del rol asignado al usuario',
  })
  @IsUUID('all', { message: 'El rolId debe ser un UUID válido' })
  @IsNotEmpty()
  rolId: string;

  @ApiProperty({
    example: 'Xyjkhjkhjkhj1*',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  clave: string;
}
