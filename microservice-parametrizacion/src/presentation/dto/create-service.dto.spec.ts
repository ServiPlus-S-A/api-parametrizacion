import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateServiceDto } from './create-service.dto';

describe('CreateServiceDto', () => {
  const buildDto = (overrides: Partial<CreateServiceDto> = {}) =>
    plainToInstance(CreateServiceDto, {
      name: 'Consultoría TI',
      category: 'TI',
      basePrice: 150.5,
      unit: 'Hora',
      ...overrides,
    });

  it('should pass validation with a valid payload', async () => {
    const errors = await validate(buildDto());
    expect(errors).toHaveLength(0);
  });

  it('should accept names with letters, numbers, spaces and hyphens', async () => {
    const errors = await validate(buildDto({ name: 'Soporte-Nivel 2' }));
    expect(errors).toHaveLength(0);
  });

  it('should reject a name with forbidden characters', async () => {
    const errors = await validate(buildDto({ name: 'Servicio @#$%' }));
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('matches');
  });

  it('should reject an empty name', async () => {
    const errors = await validate(buildDto({ name: '' }));
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should reject a base price of zero', async () => {
    const errors = await validate(buildDto({ basePrice: 0 }));
    const priceError = errors.find((e) => e.property === 'basePrice');
    expect(priceError?.constraints).toHaveProperty('isPositive');
  });

  it('should reject a negative base price', async () => {
    const errors = await validate(buildDto({ basePrice: -5 }));
    expect(errors.some((e) => e.property === 'basePrice')).toBe(true);
  });

  it('should reject a non-numeric base price', async () => {
    const errors = await validate(
      buildDto({ basePrice: 'abc' as unknown as number }),
    );
    expect(errors.some((e) => e.property === 'basePrice')).toBe(true);
  });

  it('should reject an empty category', async () => {
    const errors = await validate(buildDto({ category: '' }));
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('should reject an empty unit', async () => {
    const errors = await validate(buildDto({ unit: '' }));
    expect(errors.some((e) => e.property === 'unit')).toBe(true);
  });
});
