import { Injectable } from '@angular/core';

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();

    let request = req;

    if (token) {
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next
      .handle(request)

      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return this.auth
              .refreshToken()

              .pipe(
                switchMap(() => {
                  const newToken = this.auth.getAccessToken();

                  const newRequest = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                    },
                  });

                  return next.handle(newRequest);
                }),
              );
          }

          return throwError(() => error);
        }),
      );
  }
}
