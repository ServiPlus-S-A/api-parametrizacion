import { RoleSeeder } from './role-seeder';
import { Repository } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';

describe('RoleSeeder', () => {
  let seeder: RoleSeeder;
  let repo: jest.Mocked<Pick<Repository<RoleOrmEntity>, 'count' | 'create' | 'save'>>;

  beforeEach(() => {
    repo = {
      count: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockResolvedValue([]),
    };
    seeder = new RoleSeeder(repo as any);
  });

  describe('onModuleInit', () => {
    it('should skip seeding when roles already exist', async () => {
      repo.count.mockResolvedValue(4);
      const loggerSpy = jest.spyOn((seeder as any).logger, 'log');

      await seeder.onModuleInit();

      expect(repo.count).toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('skipping'),
      );
    });

    it('should seed 4 predefined roles when table is empty', async () => {
      repo.count.mockResolvedValue(0);
      const loggerSpy = jest.spyOn((seeder as any).logger, 'log');

      await seeder.onModuleInit();

      expect(repo.count).toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledTimes(4);
      expect(repo.save).toHaveBeenCalledTimes(1);

      const createdRoles = (repo.create as jest.Mock).mock.results.map(
        (r: any) => r.value.name,
      );
      expect(createdRoles).toEqual([
        'Admin',
        'Coordinador',
        'Tesorero',
        'Consultor',
      ]);

      expect(loggerSpy).toHaveBeenCalledWith('Seeding predefined roles...');
      expect(loggerSpy).toHaveBeenCalledWith('Seeded 4 roles.');
    });

    it('should create roles with correct structure', async () => {
      repo.count.mockResolvedValue(0);

      await seeder.onModuleInit();

      const adminRole = (repo.create as jest.Mock).mock.results[0].value;
      expect(adminRole).toMatchObject({
        name: 'Admin',
        status: 'ACTIVO',
        permissions: expect.arrayContaining(['CLIENTES:*', 'ROLES:*']),
      });
    });
  });
});
