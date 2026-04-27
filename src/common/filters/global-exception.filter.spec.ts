import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import {
  ErrorResponse,
  GlobalExceptionFilter,
} from './global-exception.filter';

function buildMockHost(url = '/test') {
  const jsonFn = jest.fn<void, [ErrorResponse]>();
  const statusFn = jest
    .fn<{ json: typeof jsonFn }, [number]>()
    .mockReturnValue({
      json: jsonFn,
    });

  const host: ArgumentsHost = {
    switchToHttp: () =>
      ({
        getRequest: () => ({ method: 'GET', url }),
        getResponse: () => ({ status: statusFn }),
      }) as unknown as HttpArgumentsHost,
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  };

  return { host, statusFn, jsonFn };
}

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  it('handles HttpException with correct status and message', () => {
    const { host, statusFn, jsonFn } = buildMockHost();

    filter.catch(new NotFoundException('User not found'), host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'User not found',
        path: '/test',
      }),
    );
  });

  it('handles validation errors with joined messages', () => {
    const { host, statusFn, jsonFn } = buildMockHost();
    const exception = new BadRequestException({
      message: ['email must be valid', 'password too short'],
    });

    filter.catch(exception, host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'email must be valid, password too short',
      }),
    );
  });

  it('handles unknown errors as 500 without leaking details', () => {
    const { host, statusFn, jsonFn } = buildMockHost();

    filter.catch(new Error('db connection lost'), host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });
});
