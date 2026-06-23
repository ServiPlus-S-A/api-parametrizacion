import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListClientsDto {
  @ApiPropertyOptional({ description: 'Partial name search (case-insensitive)' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Exact NIT / tax ID match' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Partial city search (case-insensitive)' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: ['Active', 'Inactive'] })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'], { message: 'status must be Active or Inactive' })
  status?: 'Active' | 'Inactive';

  @ApiPropertyOptional({ description: 'Zero-based page number', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'page must be a non-negative integer' })
  page: number = 0;
}
