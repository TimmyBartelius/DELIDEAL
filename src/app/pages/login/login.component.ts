import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: false,
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  onSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (res) => {
          console.log('Login successful!', res);
          
          this.router.navigate(['/home']); 
        },
        error: (err) => {
          console.error('Login failed', err);
          this.errorMessage = 'Login misslyckades. Kontrollera användarnamn och lösenord.';
        },
      });
    } else {
      alert('Vänligen fyll i alla fält.');
    }
  }
}
