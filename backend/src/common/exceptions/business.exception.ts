import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        statusCode,
        message,
        error: 'Business Error',
      },
      statusCode,
    );
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier '${identifier}' not found`, HttpStatus.NOT_FOUND);
  }
}

export class InsufficientStockException extends BusinessException {
  constructor(productName: string, requested: number, available: number) {
    super(
      `Insufficient stock for '${productName}'. Requested: ${requested}, Available: ${available}`,
      HttpStatus.CONFLICT,
    );
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidOTPException extends BusinessException {
  constructor(message: string = 'Invalid or expired OTP') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class StoreClosedException extends BusinessException {
  constructor(message: string = 'Store is currently closed') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
