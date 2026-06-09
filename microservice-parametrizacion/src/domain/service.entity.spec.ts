import { ServiceEntity } from './service.entity';

describe('ServiceEntity', () => {
  it('should create a valid service entity', () => {
    const service = new ServiceEntity('1', 'Test Service', 100, true);
    expect(service.id).toBe('1');
    expect(service.name).toBe('Test Service');
    expect(service.basePrice).toBe(100);
    expect(service.isActive).toBe(true);
  });

  it('should throw an error if base price is negative', () => {
    expect(() => new ServiceEntity('1', 'Test', -10, true)).toThrow(
      'Base price cannot be negative',
    );
  });

  it('should return correct canBeDeactivated status', () => {
    const service1 = new ServiceEntity('1', 'Test', 100, true);
    expect(service1.canBeDeactivated()).toBe(true);

    const service2 = new ServiceEntity('2', 'Test 2', 100, false);
    expect(service2.canBeDeactivated()).toBe(false);
  });
});
