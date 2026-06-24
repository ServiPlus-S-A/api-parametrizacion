import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  it('should create a valid user entity', () => {
    const user = new UserEntity(
      'uuid-123',
      'Miguel',
      'miguel@empresa.com',
      'hashed',
      'Active',
      'role-id',
    );

    expect(user.id).toBe('uuid-123');
    expect(user.nombre).toBe('Miguel');
    expect(user.email).toBe('miguel@empresa.com');
  });

  it('should throw when email format is invalid', () => {
    expect(
      () =>
        new UserEntity(
          'uuid-123',
          'Miguel',
          'correo-invalido',
          'hashed',
          'Active',
          'role-id',
        ),
    ).toThrow('El formato del correo no es válido');
  });

  it('should throw when nombre is empty', () => {
    expect(
      () =>
        new UserEntity(
          'uuid-123',
          '   ',
          'miguel@empresa.com',
          'hashed',
          'Active',
          'role-id',
        ),
    ).toThrow('El nombre no puede estar vacío');
  });
});
