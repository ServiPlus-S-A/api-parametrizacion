import { GatewayExceptionFilter } from './gateway-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

describe('GatewayExceptionFilter', () => {
  let filter: GatewayExceptionFilter;

  beforeEach(() => {
    filter = new GatewayExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should catch HttpException and format response', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse = {
        status: mockStatus,
      } as unknown as Response;

      const mockRequest = {
        url: '/test',
      } as Request;

      const mockHttpArgumentsHost = jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      });

      const mockArgumentsHost = {
        switchToHttp: mockHttpArgumentsHost,
      } as unknown as ArgumentsHost;

      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      // spy on console.error to keep test output clean
      jest.spyOn(console, 'error').mockImplementation(() => {});

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          path: '/test',
          message: 'Test error',
        }),
      );
    });

    it('should catch generic Error and format response as 500', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockResponse = {
        status: mockStatus,
      } as unknown as Response;

      const mockRequest = {
        url: '/test-generic',
      } as Request;

      const mockHttpArgumentsHost = jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      });

      const mockArgumentsHost = {
        switchToHttp: mockHttpArgumentsHost,
      } as unknown as ArgumentsHost;

      const exception = new Error('Generic error');

      jest.spyOn(console, 'error').mockImplementation(() => {});

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          path: '/test-generic',
          message: 'Internal Gateway Error',
        }),
      );
    });
  });
});
