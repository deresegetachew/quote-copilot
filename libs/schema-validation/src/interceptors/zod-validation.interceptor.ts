import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ValidationType } from '../interfaces';
import {
  getValidationSchema,
  getValidationOptions,
  getValidationType,
} from '../decorators/decorator.utils';
import { ZodValidationException } from '../exceptions';

@Injectable()
export class ZodValidationInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const controller = context.getClass();

    const schema =
      getValidationSchema(handler) ||
      getValidationSchema(controller.prototype, handler.name);
    const options =
      getValidationOptions(handler) ||
      getValidationOptions(controller.prototype, handler.name);
    const validationType =
      getValidationType(handler) ||
      getValidationType(controller.prototype, handler.name);

    if (!schema) {
      return next.handle();
    }

    const args = context.getArgs();
    let dataToValidate: any;

    switch (validationType) {
      case ValidationType.HTTP_BODY:
      case ValidationType.HTTP_QUERY:
      case ValidationType.HTTP_PARAM: {
        try {
          const httpRequest = context.switchToHttp().getRequest();
          switch (validationType) {
            case ValidationType.HTTP_BODY:
              dataToValidate = httpRequest.body;
              break;
            case ValidationType.HTTP_QUERY:
              dataToValidate = httpRequest.query;
              break;
            case ValidationType.HTTP_PARAM:
              dataToValidate = httpRequest.params;
              break;
          }
        } catch {
          throw new BadRequestException(
            `Expected HTTP context for validation type ${validationType}`,
          );
        }
        break;
      }
      case ValidationType.USECASE_COMMAND:
      case ValidationType.USECASE_QUERY:
        dataToValidate = args[0];
        break;
      case ValidationType.EVENT_PAYLOAD:
        dataToValidate = args[0]?.data || args[0];
        break;
      default:
        dataToValidate = args[0];
    }

    try {
      const result = schema.safeParse(dataToValidate);
      if (!result.success) {
        throw new ZodValidationException(
          result.error,
          validationType || 'data',
        );
      }

      if (options?.transform) {
        this.applyTransformation(context, validationType, result.data);
      }
    } catch (error) {
      if (error instanceof ZodValidationException) {
        throw error;
      }

      throw new BadRequestException(
        options?.errorMessage ||
          `Validation failed for ${validationType || 'data'}`,
      );
    }

    return next.handle();
  }

  private applyTransformation(
    context: ExecutionContext,
    validationType: ValidationType,
    transformedData: any,
  ) {
    const isHttpContext =
      validationType === ValidationType.HTTP_BODY ||
      validationType === ValidationType.HTTP_QUERY ||
      validationType === ValidationType.HTTP_PARAM;

    if (isHttpContext) {
      const request = context.switchToHttp().getRequest();
      switch (validationType) {
        case ValidationType.HTTP_BODY:
          request.body = transformedData;
          break;
        case ValidationType.HTTP_QUERY:
          request.query = transformedData;
          break;
        case ValidationType.HTTP_PARAM:
          request.params = transformedData;
          break;
      }
    } else {
      const args = context.getArgs();
      switch (validationType) {
        case ValidationType.USECASE_COMMAND:
        case ValidationType.USECASE_QUERY:
          if (args[0]) {
            Object.assign(args[0], transformedData);
          }
          break;
        case ValidationType.EVENT_PAYLOAD:
          if (args[0].data) {
            // we expect data to be there
            args[0].data = transformedData;
          }
          break;
        default: {
          if (args[0]) {
            Object.assign(args[0], transformedData);
          }
          break;
        }
      }
    }
  }
}
