import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: false,
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  register() {
  if (this.registerForm.invalid) {
    // Om formuläret är ogiltigt, gör inget
    return;
  }

  this.authService.register(this.registerForm.value).subscribe({
    next: () => {
      // Detta körs när registreringen lyckas
      this.errorMessage = null;
      alert('Registrering lyckades! Du kan nu logga in.');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      // Detta körs om registreringen misslyckas
      console.error(err);
      this.errorMessage = 'Registrering misslyckades';
    }
  });
}

}
