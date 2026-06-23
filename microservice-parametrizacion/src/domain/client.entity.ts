export class ClientEntity {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly taxId: string,
    public readonly clientType: string,
    public readonly city: string,
    public readonly email: string,
    public readonly createdById: string,
  ) {
    if (!fullName || fullName.trim().length === 0) {
      throw new Error('Full name cannot be empty');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Email must be valid');
    }
  }
}
