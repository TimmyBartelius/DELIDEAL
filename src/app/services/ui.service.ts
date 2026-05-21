import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  private profileOpenSubject = new Subject<void>();
  profileOpen$ = this.profileOpenSubject.asObservable();

  openProfile(): void {
    this.profileOpenSubject.next();
  }
}
