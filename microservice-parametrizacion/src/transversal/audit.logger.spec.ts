import { AuditLogger } from './audit.logger';

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  describe('logAction', () => {
    it('should log audit action correctly', () => {
      const loggerInstance = (
        logger as unknown as { logger: { log: jest.Mock } }
      ).logger;
      const spy = jest
        .spyOn(loggerInstance, 'log')
        .mockImplementation(() => {});

      logger.logAction('user123', 'CREATE', 'resource456');

      expect(spy).toHaveBeenCalledWith(
        'Audit: User user123 performed CREATE on resource resource456',
      );
    });
  });
});
