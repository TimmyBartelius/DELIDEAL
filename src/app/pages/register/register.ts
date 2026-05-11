import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  register() {
    console.log('FORM VALUE:', this.registerForm.value);
    if (this.registerForm.invalid) {
      // Om formuläret är ogiltigt, gör inget
      return;
    }
    const registerDto = {
      userName: this.registerForm.value.userName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(registerDto).subscribe({
      next: () => {
        this.errorMessage = null;
        // Visa tydlig feedback istället för alert
        this.errorMessage = 'Kontot har skapats! Du kan nu <a href="/login">logga in här</a>.';
        // Vänta några sekunder innan redirect, eller låt användaren klicka själv
      },
      error: (err) => {
        console.error(err);
        if (
          err.status === 400 &&
          err.error &&
          typeof err.error === 'string' &&
          err.error.includes('Email already exists')
        ) {
          this.errorMessage =
            'E-postadressen är redan registrerad. <a href="/login">Logga in här</a> eller använd en annan e-post.';
        } else if (err.status === 403) {
          this.errorMessage = 'Registrering tillåts inte - kontrollera serverinställningar.';
        } else if (err.status === 400) {
          this.errorMessage = 'Felaktig data. Kontrollera formuläret.';
        } else {
          this.errorMessage = 'Registrering misslyckades.';
        }
      },
    });
  }
}
