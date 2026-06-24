import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListRolesDto {
  @ApiPropertyOptional({
    description: 'Partial role name search (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  nombre?: string;
}
