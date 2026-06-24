import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListUserQueryDto } from './list-user.dto';

describe('ListUserQueryDto', () => {
  it('should use default values for page and size', () => {
    const dto = plainToInstance(ListUserQueryDto, {});

    expect(dto.page).toBe(0);
    expect(dto.size).toBe(10);
  });

  it('should validate a correct query dto', async () => {
    const dto = plainToInstance(ListUserQueryDto, {
      q: 'Miguel',
      estado: 'Active',
      page: 1,
      size: 5,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation when page is negative', async () => {
    const dto = plainToInstance(ListUserQueryDto, {
      page: -1,
      size: 5,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('page');
  });

  it('should fail validation when size exceeds the max value', async () => {
    const dto = plainToInstance(ListUserQueryDto, {
      page: 0,
      size: 11,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('size');
  });
});
