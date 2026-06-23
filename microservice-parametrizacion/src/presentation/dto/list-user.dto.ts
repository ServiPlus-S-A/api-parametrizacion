import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListUserQueryDto {
  @ApiPropertyOptional({
    description: 'Término de búsqueda (coincide con nombre o email)',
    example: 'Miguel',
  })
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser texto' })
  q?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado (Active, Blocked)',
    example: 'Active',
  })
  @IsOptional()
  @IsString({ message: 'El estado debe ser texto' })
  estado?: string;

  @ApiPropertyOptional({
    description: 'Número de página (empieza en 0)',
    default: 0,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(0, { message: 'La página no puede ser negativa' })
  page: number = 0;

  @ApiPropertyOptional({
    description: 'Tamaño de página (máximo 10)',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El tamaño debe ser un número entero' })
  @Min(1, { message: 'El tamaño mínimo es 1' })
  @Max(10, { message: 'El tamaño máximo es 10' })
  size: number = 10;
}
