import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsIn, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre completo del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @ApiProperty({
    example: 'uuid-del-rol',
    description: 'UUID del rol asignado',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiProperty({
    example: 'INACTIVO',
    description: 'Estado del usuario',
    enum: ['Active', 'INACTIVO'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['Active', 'INACTIVO'])
  estado?: string;

  @ApiProperty({
    example: 'nuevaClave123',
    description: 'Nueva contraseña (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nuevaClave?: string;
}
