import { RoleOrmEntity } from './role.orm-entity';

describe('RoleOrmEntity', () => {
  it('should be defined', () => {
    const entity = new RoleOrmEntity();
    expect(entity).toBeDefined();
  });

  it('should have the required fields in English', () => {
    const entity = new RoleOrmEntity();
    entity.id = 'uuid';
    entity.name = 'Administrator';
    entity.description = 'Full access';
    entity.status = 'Active';
    entity.permissions = ['READ_CLIENT', 'WRITE_CLIENT'];
    
    expect(entity.name).toBe('Administrator');
  });
});
