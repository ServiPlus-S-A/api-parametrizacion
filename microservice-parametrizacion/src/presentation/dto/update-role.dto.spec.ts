import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateRoleDto } from './update-role.dto';

describe('UpdateRoleDto', () => {
  const buildDto = (overrides: Partial<UpdateRoleDto> = {}) =>
    plainToInstance(UpdateRoleDto, overrides);

  it('should pass validation with an empty payload (all fields optional)', async () => {
    const errors = await validate(buildDto({}));
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with a valid full payload', async () => {
    const errors = await validate(
      buildDto({
        descripcion: 'Nuevo alcance',
        estado: 'ACTIVO',
        confirmar: true,
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with only descripcion', async () => {
    const errors = await validate(
      buildDto({ descripcion: 'Solo descripción' }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with only estado', async () => {
    const errors = await validate(buildDto({ estado: 'INACTIVO' }));
    expect(errors).toHaveLength(0);
  });

  it('should reject a non-boolean confirmar', async () => {
    const errors = await validate(
      buildDto({ confirmar: 'yes' as unknown as boolean }),
    );
    expect(errors.some((e) => e.property === 'confirmar')).toBe(true);
  });

  it('should reject a non-string descripcion', async () => {
    const errors = await validate(
      buildDto({ descripcion: 123 as unknown as string }),
    );
    expect(errors.some((e) => e.property === 'descripcion')).toBe(true);
  });
});
