import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ErrorResponse } from '@eproc/shared-types';

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Requête invalide',
  401: 'Non autorisé. Veuillez vous connecter.',
  403: 'Accès interdit. Vous n\'avez pas les permissions nécessaires.',
  404: 'Ressource non trouvée',
  409: 'Conflit. La ressource existe déjà.',
  422: 'Données non traitables',
  429: 'Trop de requêtes. Veuillez réessayer plus tard.',
  500: 'Erreur interne du serveur',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erreur interne du serveur';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || HTTP_STATUS_MESSAGES[status] || message;
        if (Array.isArray(resp.message)) {
          message = HTTP_STATUS_MESSAGES[status] || 'Erreur de validation';
          details = resp.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (!message || message === 'Unauthorized') {
      message = HTTP_STATUS_MESSAGES[status] || message;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        statusCode: status,
        message,
        ...(details ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
