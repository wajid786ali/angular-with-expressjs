import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any // ✅ Inject PLATFORM_ID
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // ✅ Check if running in the browser before accessing localStorage
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const expiry = localStorage.getItem('token_expiry');
      if (token && expiry && new Date().getTime() < parseInt(expiry)) {
        this.router.navigate(['/users']); // Redirect if already logged in
      }
    }
  }

  loginUser() {
    if (this.loginForm.invalid) return; 

    this.http.post<any>('http://localhost:5000/login', this.loginForm.value).subscribe(
      (response) => {
        if (isPlatformBrowser(this.platformId)) { // ✅ Check if in browser
          const expiryTime = new Date().getTime() + 10 * 60 * 1000; // 10 min expiry
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('token_expiry', expiryTime.toString());
        }

        this.router.navigate(['/users']);
      },
      (error) => {
        this.errorMessage = 'Invalid email or password';
      }
    );
  }
}
