export class RoleEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly status: string,
    public readonly permissions: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Role name cannot be empty');
    }
    if (!status || status.trim().length === 0) {
      throw new Error('Role status cannot be empty');
    }
  }
}
