import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Declara los roles permitidos para acceder a un endpoint.
 * Se evalúa junto con {@link RolesGuard} tras la autenticación JWT.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
