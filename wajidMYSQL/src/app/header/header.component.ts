import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {
    // ✅ Listen to route changes to update login status
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkLoginStatus();
      }
    });
  }

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    if (isPlatformBrowser(this.platformId)) { // ✅ Safe check for browser
      const token = localStorage.getItem('token');
      const expiry = localStorage.getItem('token_expiry');

      if (token && expiry && new Date().getTime() < parseInt(expiry)) {
        this.isLoggedIn = true;
      } else {
        this.logout();
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) { // ✅ Safe check for browser
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');
    }

    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
