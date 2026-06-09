export class ServiceEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly basePrice: number,
    public readonly isActive: boolean,
  ) {
    if (basePrice < 0) {
      throw new Error('Base price cannot be negative');
    }
  }

  canBeDeactivated(): boolean {
    return this.isActive;
  }
}
