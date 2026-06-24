import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
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
