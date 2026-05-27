import { Test, TestingModule } from '@nestjs/testing';
import { ServiceProxyController } from './service-proxy.controller';

describe('ServiceProxyController', () => {
  let controller: ServiceProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceProxyController],
    }).compile();

    controller = module.get<ServiceProxyController>(ServiceProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return proxied response', () => {
    const payload = { test: 'data' };
    const result = controller.createService(payload);
    expect(result).toEqual({ status: 'Proxied successfully', payload });
  });
});
