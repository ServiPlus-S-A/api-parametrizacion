import { RoleEntity } from './role.entity';

describe('RoleEntity', () => {
  const validArgs = {
    id: 'role-uuid',
    name: 'Admin',
    description: 'Full access',
    status: 'ACTIVO',
    permissions: ['READ_CLIENT', 'WRITE_CLIENT'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should successfully instantiate a valid RoleEntity', () => {
    const entity = new RoleEntity(
      validArgs.id,
      validArgs.name,
      validArgs.description,
      validArgs.status,
      validArgs.permissions,
      validArgs.createdAt,
      validArgs.updatedAt,
    );

    expect(entity).toBeDefined();
    expect(entity.id).toBe(validArgs.id);
    expect(entity.name).toBe(validArgs.name);
    expect(entity.permissions).toEqual(validArgs.permissions);
  });

  it('should throw an error if name is empty', () => {
    expect(() => {
      new RoleEntity(
        validArgs.id,
        '',
        validArgs.description,
        validArgs.status,
        validArgs.permissions,
        validArgs.createdAt,
        validArgs.updatedAt,
      );
    }).toThrow('Role name cannot be empty');
  });

  it('should throw an error if status is empty', () => {
    expect(() => {
      new RoleEntity(
        validArgs.id,
        validArgs.name,
        validArgs.description,
        '',
        validArgs.permissions,
        validArgs.createdAt,
        validArgs.updatedAt,
      );
    }).toThrow('Role status cannot be empty');
  });
});
