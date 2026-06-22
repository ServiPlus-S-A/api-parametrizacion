import { ServiceOrmEntity } from './service.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

describe('ServiceOrmEntity', () => {
  it('should be defined', () => {
    const entity = new ServiceOrmEntity();
    expect(entity).toBeDefined();
  });

  it('should have the required fields in English and map to User', () => {
    const entity = new ServiceOrmEntity();
    entity.id = 'uuid';
    entity.name = 'Consulting';
    entity.description = 'General consulting';
    entity.basePrice = 100.50;
    entity.category = 'Professional';
    entity.isActive = true;
    
    const user = new UserOrmEntity();
    user.fullName = 'Creator User';
    entity.createdBy = user;
    
    expect(entity.name).toBe('Consulting');
    expect(entity.createdBy.fullName).toBe('Creator User');
  });
});
