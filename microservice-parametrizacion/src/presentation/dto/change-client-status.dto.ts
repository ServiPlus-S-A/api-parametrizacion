import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeClientStatusDto {
  @ApiProperty({
    enum: ['Active', 'Inactive'],
    description: 'New status for the client',
  })
  @IsEnum(['Active', 'Inactive'], {
    message: 'status must be Active or Inactive',
  })
  status: 'Active' | 'Inactive';

  @ApiProperty({
    description: 'Reason for the status change',
    example: 'Late payment',
  })
  @IsString()
  @IsNotEmpty({ message: 'motivo is required and cannot be empty' })
  motivo: string;
}
