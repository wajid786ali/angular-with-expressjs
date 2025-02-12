import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000'; // ✅ Base API URL

  constructor(private http: HttpClient) {}

  // ✅ Fetch user by ID
  getUserById(userId: number): Observable<any> {  
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Register new user
  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ User login
  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Get user profile by ID
  getProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Fetch all users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Delete user
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Update user
  updateUser(id: number, data: FormData): Observable<any> { 
    return this.http.put(`${this.apiUrl}/users/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Error handling function
  private handleError(error: HttpErrorResponse) {
    console.error("⚠️ API Error:", error);
    return throwError(() => new Error("Something went wrong. Please try again later."));
  }
}
