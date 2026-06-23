export class ServiceEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly basePrice: number,
    public readonly isActive: boolean,
    public readonly category?: string,
    public readonly unit?: string,
  ) {
    if (basePrice <= 0) {
      throw new Error('Base price must be greater than zero');
    }
  }

  canBeDeactivated(): boolean {
    return this.isActive;
  }
}
