import {
  IsString,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiPropertyOptional({
    example: 'Consultoría TI Avanzada',
    description: 'Nuevo nombre del servicio',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\p{L}\p{N}\s-]+$/u, {
    message: 'El nombre solo puede contener letras, números y guiones',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'Cloud',
    description: 'Nueva categoría del servicio',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @ApiPropertyOptional({
    example: 200.0,
    description: 'Nueva tarifa base (debe ser mayor a 0)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'La tarifa base debe ser mayor a 0' })
  basePrice?: number;

  @ApiPropertyOptional({
    example: 'Día',
    description: 'Nueva unidad de medida',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unit?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Estado del servicio (true = activo, false = inactivo)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
