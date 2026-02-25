import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@abp/ng.core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();

    if (token) {
      // Skapa en ny request med Authorization header
      const clonedReq = req.clone({
        headers: req.headers.set(`Authorization`, `Bearer ${token}`),
      });
      return next.handle(clonedReq);
    }
    return next.handle(req);
  }
}
