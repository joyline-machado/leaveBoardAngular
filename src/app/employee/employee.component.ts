import { Component } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent {
  
  opened = false;
  loggedInUser: any;
  userData!: Observable<any>;
  loggedInUserName!: string; 

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ){
    const userData = localStorage.getItem('user');
    if (userData) {
      this.loggedInUser = JSON.parse(userData);
    }

    this.getLoggedInUser()
  }

  getLoggedInUser(){
    let loggedInUserEmail = this.loggedInUser.email;
    const userCollection = collection(this.firestore, 'Users');
    
    const userQuery = query(userCollection, where('email', '==', loggedInUserEmail));

    this.userData = collectionData(userQuery, { idField: 'id' });

    this.userData.subscribe(users => {
      if (users.length > 0) {
         this.loggedInUserName = users[0].name;
      } else {
        console.log('User not found');
      }
    })
    


  }

  handleLogout(){
    this.authService.logout();
  }

  resetPassword() {

    const auth = getAuth();
    sendPasswordResetEmail(auth, this.loggedInUser.email)
      .then(() => {
        this.snackBar.open('Password reset link has been sent to your registered email', 'close', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.log(error)
      });
  }


}
