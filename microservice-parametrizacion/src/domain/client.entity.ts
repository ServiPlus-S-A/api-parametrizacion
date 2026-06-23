export class ClientEntity {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly taxId: string,
    public readonly clientType: string,
    public readonly city: string,
    public readonly email: string,
    public readonly status: 'Active' | 'Inactive',
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    if (!fullName || fullName.trim() === '') {
      throw new Error('Client full name cannot be empty');
    }
    if (!taxId || taxId.trim() === '') {
      throw new Error('Client taxId cannot be empty');
    }
  }

  canChangeStatus(): boolean {
    // Business rule: status can always be toggled.
    // Specific restrictions (e.g. active solicitudes) are enforced in the use case.
    return true;
  }
}
