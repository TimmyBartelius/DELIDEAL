import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), this.passwordStrengthValidator],
      ],
    });
  }

  // Anpassad validerare för lösenord
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    if (!/[A-Za-z]/.test(value)) {
      return { letter: true };
    }
    if (!/[0-9]/.test(value)) {
      return { digit: true };
    }
    return null;
  }

  register() {
    this.errorMessage = null;
    this.isLoading = true;
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      this.errorMessage = 'Fyll i alla fält korrekt.';
      this.isLoading = false;
      return;
    }
    const registerDto = {
      userName: this.registerForm.value.userName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(registerDto).subscribe({
      next: (res) => {
        this.errorMessage = 'Kontot har skapats! Du kan nu logga in.';
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err?.error) {
          if (typeof err.error === 'string' && err.error.trim().length > 0) {
            this.errorMessage = err.error;
          } else if (typeof err.error === 'object' && (err.error.message || err.error.title)) {
            this.errorMessage = err.error.message || err.error.title;
          } else if (typeof err.error === 'object') {
            this.errorMessage = JSON.stringify(err.error);
          } else {
            this.errorMessage = 'Registrering misslyckades (okänt fel).';
          }
        } else if (err?.message) {
          this.errorMessage = err.message;
        } else if (err?.status) {
          this.errorMessage = `Fel ${err.status} vid ${err.url || 'anrop'}`;
        } else {
          this.errorMessage = 'Registrering misslyckades.';
        }
      },
    });
  }
}
