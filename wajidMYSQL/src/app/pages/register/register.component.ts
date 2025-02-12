import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedFile: File | null = null;
  registrationSuccess: boolean = false; // Flag for registration success

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      username: ['', Validators.required], // ✅ Add username field
      password: ['', Validators.required],
      address: ['', Validators.required],
      photo: [null]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append("name", this.registerForm.value.name);
    formData.append("email", this.registerForm.value.email);
    formData.append("mobile", this.registerForm.value.mobile);
    formData.append("username", this.registerForm.value.username); // ✅ Ensure username exists
    formData.append("password", this.registerForm.value.password);
    formData.append("address", this.registerForm.value.address);

    if (this.selectedFile) {
      formData.append("photo", this.selectedFile);
    }

    this.authService.register(formData).subscribe(
      (response) => {
        console.log("✅ Registration successful:", response);
        this.registrationSuccess = true;
        this.registerForm.reset();
      },
      (error) => {
        console.error("❌ Registration failed:", error);
      }
    );
  }
}
