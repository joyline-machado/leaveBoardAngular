import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddUserComponent } from './add-user/add-user.component';
import { Employee } from 'src/app/model/employee';
import { DataService } from 'src/app/shared/data.service';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  userData!: Observable<any>;
  employeeList: Employee[] = [];
  isLoading: boolean = true;
  isDeleting: boolean = false;


  filteredUserData: any[] = [];


  constructor(public dialog: MatDialog,
    private dataService: DataService,
    private firestore: Firestore
  ) { }

  ngOnInit(): void {
    this.getAllEmployees();

    this.userData.subscribe(data => {
      this.filteredUserData = data;
    });
  }

  openDialog() {
    this.dialog.open(AddUserComponent, {
      width: '65%',
      height: '410px'
    });
  }

  getAllEmployees() {
    this.isLoading = true;
    const collectionInstance = collection(this.firestore, '/Users');
    collectionData(collectionInstance).subscribe(val => {
      console.log(val);
      this.isLoading = false;
    })
    this.userData = collectionData(collectionInstance, { idField: 'id' });


  }

  deleteEmployeee(id: string) {
    this.isDeleting = true;
    this.dataService.deleteEmp(id)
    this.getAllEmployees()
    this.isDeleting = false;
  }

  async deleteEmployee(id: string) {
    this.isLoading = true; 
    try {
      await this.dataService.deleteEmp(id);
      
      this.getAllEmployees();
    } catch (error) {
    
    } finally {
      this.isLoading = false; 
    }
  }
  

  openDeleteDialog(ref: TemplateRef<any>, id: string) {
    this.dialog.open(ref, {
      data: { id }
    });
  }

  openEditPopup(id: string) {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: '65%',
      height: '420px',
      data: { id }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Edited data:', result);

      }
      else {
        console.log({ id })
      }
    });
  }



  passwordReset(email: string) {

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.log(error)
      });
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.userData.subscribe(data => {
      this.filteredUserData = data.filter((user: any) => {
        return user.name.toLowerCase().includes(filterValue) ||
          user.email.toLowerCase().includes(filterValue) || 
          user.empID.toLowerCase().includes(filterValue) ||
          user.phone.toString().toLowerCase().includes(filterValue) ||
          user.designation.toLowerCase().includes(filterValue) 

      });
    });
    // console.log(filterValue)
  }



}
