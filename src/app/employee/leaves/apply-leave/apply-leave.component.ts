import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/shared/employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss']
})
export class ApplyLeaveComponent implements OnInit {

  leaveForm!: FormGroup;
  loggedInUser: any;
  isLoading: boolean = true;
  isLoading2!: boolean;
  // matcher = new ApplyLeaveComponent();
  submitted: boolean = false;
  message!: string;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ApplyLeaveComponent>,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public leaveReq: any,
  ) {

    const userData = localStorage.getItem('user');

    if (userData) {
      this.loggedInUser = JSON.parse(userData);
    }



  }

  ngOnInit(): void {
    this.leaveForm = this.formBuilder.group({
      leaveType: ['', [Validators.required]],
      leaveReason: ['', [Validators.required, Validators.minLength(5)]],
      leaveFrom: ['', [Validators.required]],
      leaveTo: ['', [Validators.required]],

    });

    if (this.leaveReq) {
      this.isLoading2 = true
      this.isLoading = true
      const leaveId = this.leaveReq.id;
      this.employeeService.getLeaveById(leaveId).subscribe((leave) => {
        this.leaveForm.patchValue({
          leaveType: leave.leaveType,
          leaveReason: leave.leaveReason,
          leaveFrom: new Date(leave.leaveFrom.toDate()),
          leaveTo: new Date(leave.leaveTo.toDate()),
        });
      });
      this.isLoading = false
      this.isLoading2 = false
    }
  }



  applyLeave(leaveForm: any) {

    this.submitted = true;
    if (leaveForm.valid) {
      this.isLoading2 = true;
      leaveForm.value.status = 'Pending';
      leaveForm.value.userName = this.loggedInUser.email;

      this.employeeService.applyLeave(leaveForm);
      leaveForm.reset()

      this.dialogRef.close();
      this.isLoading2 = false;
    }

  }

  editLeave() {
    this.submitted = true;
    if (this.leaveForm.pristine) {
      this.message = "No changes has been done"
      this.snackBar.open(this.message, 'close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
    else if (this.leaveForm.valid) {
      this.isLoading2 = true;
      const formData = this.leaveForm.value;

      const leaveId = this.leaveReq.id;

      this.employeeService.editLeave(leaveId, formData).then(() => {
        this.dialogRef.close();
        this.snackBar.open('Leave has been edited', 'close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      });
      this.isLoading2 = false;

    }

  }

}
