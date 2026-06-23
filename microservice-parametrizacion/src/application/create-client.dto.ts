import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    example: 'Empresa XYZ S.A.S',
    description: 'Nombre completo del cliente',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(120)
  fullName: string;

  @ApiProperty({
    example: '900123456-7',
    description: 'NIT o cédula del cliente',
    maxLength: 15,
  })
  @IsString()
  @IsNotEmpty({ message: 'El NIT / cédula es obligatorio' })
  @MaxLength(15)
  taxId: string;

  @ApiProperty({
    example: 'Empresarial',
    description: 'Tipo de cliente',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'El tipo de cliente es obligatorio' })
  @MaxLength(50)
  clientType: string;

  @ApiProperty({
    example: 'Bogotá',
    description: 'Ciudad del cliente',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  @MaxLength(100)
  city: string;

  @ApiProperty({
    example: 'contacto@xyz.com',
    description: 'Correo electrónico único del cliente',
  })
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario al que pertenece este cliente',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El cliente debe estar asociado a un usuario' })
  userId: string;
}
