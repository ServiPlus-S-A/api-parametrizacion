import { UserOrmEntity } from './user.orm-entity';
import { RoleOrmEntity } from './role.orm-entity';

describe('UserOrmEntity', () => {
  it('should be defined', () => {
    const entity = new UserOrmEntity();
    expect(entity).toBeDefined();
  });

  it('should have the required fields in English and map to Role', () => {
    const entity = new UserOrmEntity();
    entity.id = 'uuid';
    entity.fullName = 'John Doe';
    entity.email = 'john@example.com';
    entity.password = 'hashedpwd';
    entity.status = 'Active';
    entity.failedAttempts = 0;
    entity.blockedUntil = null;

    const role = new RoleOrmEntity();
    role.name = 'Admin';
    entity.role = role;

    expect(entity.email).toBe('john@example.com');
    expect(entity.password).toBe('hashedpwd');
    expect(entity.role.name).toBe('Admin');
  });
});
