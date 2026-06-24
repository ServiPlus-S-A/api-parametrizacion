import { RoleSeeder } from './role-seeder';
import { Repository } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';

describe('RoleSeeder', () => {
  let seeder: RoleSeeder;
  let repo: jest.Mocked<
    Pick<Repository<RoleOrmEntity>, 'count' | 'create' | 'save'>
  >;

  beforeEach(() => {
    repo = {
      count: jest.fn(),
      create: jest
        .fn()
        .mockImplementation((dto: Partial<RoleOrmEntity>) => dto),
      save: jest.fn().mockResolvedValue([] as unknown),
    };
    seeder = new RoleSeeder(repo as unknown as Repository<RoleOrmEntity>);
  });

  describe('onModuleInit', () => {
    it('should skip seeding when roles already exist', async () => {
      repo.count.mockResolvedValue(4);

      await seeder.onModuleInit();

      expect(repo.count).toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should seed 4 predefined roles when table is empty', async () => {
      repo.count.mockResolvedValue(0);

      await seeder.onModuleInit();

      expect(repo.count).toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledTimes(4);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('should create roles with correct names', async () => {
      repo.count.mockResolvedValue(0);

      await seeder.onModuleInit();

      const createdRoles = jest
        .mocked(repo.create)
        .mock.calls.map((call) => (call[0] as Partial<RoleOrmEntity>).name);
      expect(createdRoles).toEqual([
        'Admin',
        'Coordinador',
        'Tesorero',
        'Consultor',
      ]);
    });

    it('should create admin role with correct structure', async () => {
      repo.count.mockResolvedValue(0);

      await seeder.onModuleInit();

      const adminArgs = jest.mocked(repo.create).mock.calls[0][0];
      expect((adminArgs as Partial<RoleOrmEntity>).name).toBe('Admin');
      expect((adminArgs as Partial<RoleOrmEntity>).status).toBe('ACTIVO');
      expect((adminArgs as Partial<RoleOrmEntity>).permissions).toEqual(
        expect.arrayContaining(['CLIENTES:*', 'ROLES:*']),
      );
    });
  });
});
