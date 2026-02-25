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
        // Detta körs när registreringen lyckas
        this.errorMessage = null;
        alert('Registrering lyckades! Du kan nu logga in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        // Detta körs om registreringen misslyckas
        console.error(err);

        if (err.status === 403) {
          this.errorMessage = 'Registrering tillåts inte - kontrollera serverinställningar.';
        } else if (err.status === 400) {
          this.errorMessage = 'Felaktig data. Kontrollera formuläret.';
        } else {
          this.errorMessage = 'Registrering misslyckades';
        }
      },
    });
  }
}
