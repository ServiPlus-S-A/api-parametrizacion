import { ClientEntity } from './client.entity';

describe('ClientEntity', () => {
  const validArgs = {
    id: 'client-uuid',
    fullName: 'Empresa XYZ S.A.S',
    taxId: '900123456-7',
    clientType: 'Empresarial',
    city: 'Bogotá',
    email: 'contacto@xyz.com',
    createdById: 'admin-uuid',
    userId: 'user-uuid',
  };

  it('should successfully instantiate a valid ClientEntity', () => {
    const client = new ClientEntity(
      validArgs.id,
      validArgs.fullName,
      validArgs.taxId,
      validArgs.clientType,
      validArgs.city,
      validArgs.email,
      validArgs.createdById,
      validArgs.userId,
    );

    expect(client).toBeDefined();
    expect(client.id).toBe(validArgs.id);
    expect(client.fullName).toBe(validArgs.fullName);
  });

  it('should throw an error if fullName is empty', () => {
    expect(() => {
      new ClientEntity(
        validArgs.id,
        '',
        validArgs.taxId,
        validArgs.clientType,
        validArgs.city,
        validArgs.email,
        validArgs.createdById,
        validArgs.userId,
      );
    }).toThrow('Full name cannot be empty');

    expect(() => {
      new ClientEntity(
        validArgs.id,
        '   ',
        validArgs.taxId,
        validArgs.clientType,
        validArgs.city,
        validArgs.email,
        validArgs.createdById,
        validArgs.userId,
      );
    }).toThrow('Full name cannot be empty');
  });

  it('should throw an error if email is invalid', () => {
    expect(() => {
      new ClientEntity(
        validArgs.id,
        validArgs.fullName,
        validArgs.taxId,
        validArgs.clientType,
        validArgs.city,
        'invalidemail',
        validArgs.createdById,
        validArgs.userId,
      );
    }).toThrow('Email must be valid');

    expect(() => {
      new ClientEntity(
        validArgs.id,
        validArgs.fullName,
        validArgs.taxId,
        validArgs.clientType,
        validArgs.city,
        '',
        validArgs.createdById,
        validArgs.userId,
      );
    }).toThrow('Email must be valid');
  });

  it('should throw an error if userId is empty', () => {
    expect(() => {
      new ClientEntity(
        validArgs.id,
        validArgs.fullName,
        validArgs.taxId,
        validArgs.clientType,
        validArgs.city,
        validArgs.email,
        validArgs.createdById,
        '',
      );
    }).toThrow('A client must be associated to a user');

    expect(() => {
      new ClientEntity(
        validArgs.id,
        validArgs.fullName,
        validArgs.taxId,
        validArgs.clientType,
        validArgs.city,
        validArgs.email,
        validArgs.createdById,
        '    ',
      );
    }).toThrow('A client must be associated to a user');
  });
});
