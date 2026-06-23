import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ListServicesDto } from './list-services.dto';

describe('ListServicesDto', () => {
  it('should pass with an empty query (all filters optional)', async () => {
    const dto = plainToInstance(ListServicesDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should transform the page string into a number', async () => {
    const dto = plainToInstance(ListServicesDto, { page: '3' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(3);
  });

  it('should reject a negative page', async () => {
    const dto = plainToInstance(ListServicesDto, { page: '-1' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('should transform the isActive string "true" into boolean true', async () => {
    const dto = plainToInstance(ListServicesDto, { isActive: 'true' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.isActive).toBe(true);
  });

  it('should transform the isActive string "false" into boolean false', async () => {
    const dto = plainToInstance(ListServicesDto, { isActive: 'false' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.isActive).toBe(false);
  });

  it('should leave isActive undefined when it is not provided', () => {
    const dto = plainToInstance(ListServicesDto, { name: 'cons' });
    expect(dto.isActive).toBeUndefined();
  });

  it('should treat an explicit null isActive as undefined', () => {
    const dto = plainToInstance(ListServicesDto, { isActive: null });
    expect(dto.isActive).toBeUndefined();
  });

  it('should accept name and category filters', async () => {
    const dto = plainToInstance(ListServicesDto, {
      name: 'cons',
      category: 'TI',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
