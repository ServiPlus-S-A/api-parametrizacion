/* eslint-disable @typescript-eslint/unbound-method */
import { CreateClientUseCase } from './create-client.use-case';
import { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';
import { CreateClientDto } from './create-client.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CreateClientUseCase', () => {
  let useCase: CreateClientUseCase;
  let mockRepository: jest.Mocked<IClientRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByTaxId: jest.fn(),
      userExists: jest.fn(),
      findByUserId: jest.fn(),
    } as any;
    useCase = new CreateClientUseCase(mockRepository);
  });

  const validDto: CreateClientDto = {
    fullName: 'Daniel2',
    taxId: '900123456-7',
    clientType: 'Empresarial',
    city: 'Cali',
    email: 'contacto@xyz.com',
    userId: 'd8376c24-5dbf-474e-c8e3-90c58e5a1b2c', // A valid UUID
  };

  const createdById = 'user-creator-uuid';

  it('should successfully create a new client when validations pass', async () => {
    // Arrange
    mockRepository.userExists.mockResolvedValue(true);
    mockRepository.findByUserId.mockResolvedValue(null);
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.findByTaxId.mockResolvedValue(null);
    mockRepository.save.mockImplementation((entity) => Promise.resolve(entity));

    // Act
    const result = await useCase.execute(validDto, createdById);

    // Assert
    expect(result).toBeInstanceOf(ClientEntity);
    expect(result.fullName).toBe(validDto.fullName);
    expect(result.taxId).toBe(validDto.taxId);
    expect(result.clientType).toBe(validDto.clientType);
    expect(result.city).toBe(validDto.city);
    expect(result.email).toBe(validDto.email);
    expect(result.userId).toBe(validDto.userId);
    expect(result.createdById).toBe(createdById);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException if associated user does not exist', async () => {
    // Arrange
    mockRepository.userExists.mockResolvedValue(false);

    // Act & Assert
    await expect(useCase.execute(validDto, createdById)).rejects.toThrow(NotFoundException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if client email already exists', async () => {
    // Arrange
    mockRepository.userExists.mockResolvedValue(true);
    mockRepository.findByEmail.mockResolvedValue(
      new ClientEntity(
        'existing-client-uuid',
        'Existing Client',
        '111111-1',
        'Empresarial',
        'Bogota',
        'contacto@xyz.com',
        createdById,
        validDto.userId,
      ),
    );

    // Act & Assert
    await expect(useCase.execute(validDto, createdById)).rejects.toThrow(ConflictException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if client taxId already exists', async () => {
    // Arrange
    mockRepository.userExists.mockResolvedValue(true);
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.findByTaxId.mockResolvedValue(
      new ClientEntity(
        'existing-client-uuid',
        'Existing Client',
        '900123456-7',
        'Empresarial',
        'Bogota',
        'different@email.com',
        createdById,
        validDto.userId,
      ),
    );

    // Act & Assert
    await expect(useCase.execute(validDto, createdById)).rejects.toThrow(ConflictException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if user is already assigned to a client', async () => {
    // Arrange
    mockRepository.userExists.mockResolvedValue(true);
    mockRepository.findByUserId.mockResolvedValue(
      new ClientEntity(
        'existing-client-uuid',
        'Existing Client',
        '111111-1',
        'Empresarial',
        'Bogota',
        'different@email.com',
        createdById,
        validDto.userId,
      ),
    );

    // Act & Assert
    await expect(useCase.execute(validDto, createdById)).rejects.toThrow(ConflictException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
