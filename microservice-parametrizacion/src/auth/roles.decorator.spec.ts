/* eslint-disable @typescript-eslint/unbound-method */
import { Roles, ROLES_KEY } from './roles.decorator';

describe('Roles decorator', () => {
  it('should attach the provided roles as metadata under ROLES_KEY', () => {
    class TestTarget {
      @Roles('Admin')
      handler() {}
    }

    const metadata = Reflect.getMetadata(
      ROLES_KEY,
      TestTarget.prototype.handler,
    ) as string[];

    expect(metadata).toEqual(['Admin']);
  });

  it('should support multiple roles', () => {
    class TestTarget {
      @Roles('Admin', 'Supervisor')
      handler() {}
    }

    const metadata = Reflect.getMetadata(
      ROLES_KEY,
      TestTarget.prototype.handler,
    ) as string[];

    expect(metadata).toEqual(['Admin', 'Supervisor']);
  });
});
