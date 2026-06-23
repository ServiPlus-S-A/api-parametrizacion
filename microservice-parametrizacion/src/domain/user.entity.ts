export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly email: string,
    public readonly clave: string,
    public readonly estado: string,
    public readonly rolId: string,
  ) {
    if (!email.includes('@')) {
      throw new Error('El formato del correo no es válido');
    }
    if (nombre.trim().length === 0) {
      throw new Error('El nombre no puede estar vacío');
    }
  }
}
