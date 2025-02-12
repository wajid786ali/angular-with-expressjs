import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {}

  canActivate(): boolean {
    // ✅ Check if running in the browser before accessing localStorage
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        return true;
      }
    }

    // Redirect to login if not authenticated
    this.router.navigate(['/login']);
    return false;
  }
}
