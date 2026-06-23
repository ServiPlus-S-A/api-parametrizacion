import {
  IsString,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Consultoría TI',
    description: 'Nombre del servicio a parametrizar',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\p{L}\p{N}\s-]+$/u, {
    message: 'El nombre solo puede contener letras, números y guiones',
  })
  name: string;

  @ApiProperty({
    example: 'TI',
    description: 'Categoría a la que pertenece el servicio',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 150.5,
    description:
      'Tarifa base inicial asignada al servicio (debe ser mayor a 0)',
    minimum: 0,
  })
  @IsNumber()
  @IsPositive({ message: 'La tarifa base debe ser mayor a 0' })
  basePrice: number;

  @ApiProperty({
    example: 'Hora',
    description: 'Unidad de medida sobre la que se aplica la tarifa',
  })
  @IsString()
  @IsNotEmpty()
  unit: string;
}
