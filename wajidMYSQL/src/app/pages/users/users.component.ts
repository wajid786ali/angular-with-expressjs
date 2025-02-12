import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var $: any; // Required for Bootstrap 4 modal

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  selectedUserId: number | null = null;
  newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;

  updateForm!: FormGroup;

  constructor(
    public router: Router,
    private userService: AuthService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadUsers();

    // Initialize the update form
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required]
    });
  }

  // Load all users
  loadUsers() {
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error("❌ Error fetching users:", error);
      }
    );
  }

  // View user profile
  viewProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }

  // Delete user
  deleteUser(userId: number) {
    if (confirm("Are you sure you want to delete this user?")) {
      this.userService.deleteUser(userId).subscribe(
        () => {
          this.users = this.users.filter(user => user.id !== userId);
          alert("✅ User deleted successfully!");
        },
        (error) => {
          console.error("❌ Error deleting user:", error);
        }
      );
    }
  }

  // Open Reset Password Modal
  openResetPasswordModal(userId: number) {
    this.selectedUserId = userId;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordMismatch = false;
    $('#passwordChangeModal').modal('show');
  } 

  // Reset Password
  resetPassword() {
    if (!this.selectedUserId) {
      alert("User not selected!");
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    const data = { userId: this.selectedUserId, newPassword: this.newPassword };

    this.http.post("http://localhost:5000/reset-password", data).subscribe(
      () => {
        alert("✅ Password reset successfully!");
        $('#passwordChangeModal').modal('hide');
      },
      (err) => {
        console.error("❌ Error resetting password:", err);
      }
    );
  }
  
}
