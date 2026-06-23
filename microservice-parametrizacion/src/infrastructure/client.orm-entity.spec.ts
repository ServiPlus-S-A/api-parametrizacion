import { ClientOrmEntity } from './client.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

describe('ClientOrmEntity', () => {
  it('should be defined', () => {
    const entity = new ClientOrmEntity();
    expect(entity).toBeDefined();
  });

  it('should have the required fields in English and map to User', () => {
    const entity = new ClientOrmEntity();
    entity.id = 'uuid';
    entity.fullName = 'Jane Doe';
    entity.taxId = '123456789';
    entity.clientType = 'Persona natural';
    entity.city = 'Bogota';
    entity.email = 'jane@example.com';

    const user = new UserOrmEntity();
    user.fullName = 'Creator User';
    entity.createdBy = user;

    expect(entity.fullName).toBe('Jane Doe');
    expect(entity.createdBy.fullName).toBe('Creator User');
  });
});
