import { ObserverEvent } from './observer.event';

describe('ObserverEvent', () => {
  let observer: ObserverEvent;

  beforeEach(() => {
    observer = new ObserverEvent();
  });

  it('should be defined', () => {
    expect(observer).toBeDefined();
  });

  describe('emitCriticalAlert', () => {
    it('should emit event payload to console', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const payload = { data: 'critical failure' };
      observer.emitCriticalAlert('CRITICAL_ERROR', payload);

      expect(spy).toHaveBeenCalledWith(
        '[Observer] Emitting event: CRITICAL_ERROR',
        payload,
      );
    });
  });
});
