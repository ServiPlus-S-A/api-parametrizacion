import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(120)
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'El NIT / cédula es obligatorio' })
  @MaxLength(15)
  taxId: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de cliente es obligatorio' })
  @MaxLength(50)
  clientType: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  @MaxLength(100)
  city: string;

  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;
}
