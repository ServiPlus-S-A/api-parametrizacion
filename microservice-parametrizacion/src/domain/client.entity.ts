export class ClientEntity {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly taxId: string,
    public readonly clientType: string,
    public readonly city: string,
    public readonly email: string,
    public readonly status: 'Active' | 'Inactive',
    public readonly createdById: string,
    public readonly userId: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    if (!fullName || fullName.trim().length === 0) {
      throw new Error('Full name cannot be empty');
    }
    if (!taxId || taxId.trim() === '') {
      throw new Error('Client taxId cannot be empty');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Email must be valid');
    }
    if (!userId || userId.trim().length === 0) {
      throw new Error('A client must be associated to a user');
    }
  }

  canChangeStatus(): boolean {
    // Business rule: status can always be toggled.
    // Specific restrictions (e.g. active solicitudes) are enforced in the use case.
    return true;
  }
}
