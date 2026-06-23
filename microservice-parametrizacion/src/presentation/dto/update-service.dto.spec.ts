import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateServiceDto } from './update-service.dto';

describe('UpdateServiceDto', () => {
  const buildDto = (overrides: Partial<UpdateServiceDto> = {}) =>
    plainToInstance(UpdateServiceDto, overrides);

  it('should pass validation with an empty payload (all fields optional)', async () => {
    const errors = await validate(buildDto({}));
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with a valid full payload', async () => {
    const errors = await validate(
      buildDto({
        name: 'Servicio Actualizado',
        category: 'Cloud',
        basePrice: 200,
        unit: 'Día',
        isActive: false,
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid name (special characters)', async () => {
    const errors = await validate(buildDto({ name: 'Servicio @#$%' }));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should reject an empty name string', async () => {
    const errors = await validate(buildDto({ name: '' }));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should reject a basePrice of zero', async () => {
    const errors = await validate(buildDto({ basePrice: 0 }));
    expect(errors.some((e) => e.property === 'basePrice')).toBe(true);
  });

  it('should reject a negative basePrice', async () => {
    const errors = await validate(buildDto({ basePrice: -10 }));
    expect(errors.some((e) => e.property === 'basePrice')).toBe(true);
  });

  it('should reject a non-numeric basePrice', async () => {
    const errors = await validate(
      buildDto({ basePrice: 'abc' as unknown as number }),
    );
    expect(errors.some((e) => e.property === 'basePrice')).toBe(true);
  });

  it('should reject an empty category string', async () => {
    const errors = await validate(buildDto({ category: '' }));
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('should reject an empty unit string', async () => {
    const errors = await validate(buildDto({ unit: '' }));
    expect(errors.some((e) => e.property === 'unit')).toBe(true);
  });

  it('should reject a non-boolean isActive', async () => {
    const errors = await validate(
      buildDto({ isActive: 'yes' as unknown as boolean }),
    );
    expect(errors.some((e) => e.property === 'isActive')).toBe(true);
  });
});
