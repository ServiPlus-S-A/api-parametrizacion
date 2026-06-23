import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Mantenimiento de Aire Acondicionado',
    description: 'Nombre del servicio a parametrizar',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 150.5,
    description: 'Precio base inicial asignado al servicio',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  basePrice: number;
}
