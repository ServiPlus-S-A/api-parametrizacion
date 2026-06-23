import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateClientDto } from './create-client.dto';

describe('CreateClientDto', () => {
  const buildDto = (overrides: Partial<CreateClientDto> = {}) =>
    plainToInstance(CreateClientDto, {
      fullName: 'Empresa XYZ S.A.S',
      taxId: '900123456-7',
      clientType: 'Empresarial',
      city: 'Bogotá',
      email: 'contacto@xyz.com',
      userId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
      ...overrides,
    });

  it('should pass validation with a valid payload', async () => {
    const errors = await validate(buildDto());
    expect(errors).toHaveLength(0);
  });

  it('should reject an empty fullName', async () => {
    const errors = await validate(buildDto({ fullName: '' }));
    expect(errors.some((e) => e.property === 'fullName')).toBe(true);
  });

  it('should reject a too long fullName', async () => {
    const longName = 'a'.repeat(121);
    const errors = await validate(buildDto({ fullName: longName }));
    expect(errors.some((e) => e.property === 'fullName')).toBe(true);
  });

  it('should reject an empty taxId', async () => {
    const errors = await validate(buildDto({ taxId: '' }));
    expect(errors.some((e) => e.property === 'taxId')).toBe(true);
  });

  it('should reject a too long taxId', async () => {
    const longTaxId = '1'.repeat(16);
    const errors = await validate(buildDto({ taxId: longTaxId }));
    expect(errors.some((e) => e.property === 'taxId')).toBe(true);
  });

  it('should reject an empty clientType', async () => {
    const errors = await validate(buildDto({ clientType: '' }));
    expect(errors.some((e) => e.property === 'clientType')).toBe(true);
  });

  it('should reject an empty city', async () => {
    const errors = await validate(buildDto({ city: '' }));
    expect(errors.some((e) => e.property === 'city')).toBe(true);
  });

  it('should reject an invalid email format', async () => {
    const errors = await validate(buildDto({ email: 'invalid-email' }));
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should reject an empty email', async () => {
    const errors = await validate(buildDto({ email: '' }));
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should reject an invalid userId UUID', async () => {
    const errors = await validate(buildDto({ userId: 'not-a-uuid' }));
    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });

  it('should reject an empty userId', async () => {
    const errors = await validate(buildDto({ userId: '' }));
    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });
});
