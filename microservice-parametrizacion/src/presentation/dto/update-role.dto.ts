import {
  IsOptional,
  IsString,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre del rol (4-30 caracteres alfanuméricos)',
    example: 'Supervisor',
    minLength: 4,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @Length(4, 30, {
    message: 'El nombre debe tener entre 4 y 30 caracteres',
  })
  @Matches(/^[\p{L}\p{N}\s-]+$/u, {
    message: 'El nombre solo puede contener letras, números y guiones',
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción del rol',
    example: 'Nuevo alcance',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Nuevo estado del rol (ACTIVO/INACTIVO)',
    example: 'ACTIVO',
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Confirma la desactivación incluso si hay usuarios asociados',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  confirmar?: boolean;
}
