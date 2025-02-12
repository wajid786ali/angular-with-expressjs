import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userId: number | null = null;
  user: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.userId) {
      this.http.get(`http://localhost:5000/profile/${this.userId}`).subscribe(
        (response) => {
          this.user = response;
        },
        (error) => {
          console.error("Error fetching profile:", error);
        }
      );
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login after logout
  } 
}
