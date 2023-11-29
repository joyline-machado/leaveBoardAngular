import { Component , Input, OnInit, Inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/shared/data.service';

@Component({
  selector: 'app-add-holiday',
  templateUrl: './add-holiday.component.html',
  styleUrls: ['./add-holiday.component.scss']
})
export class AddHolidayComponent implements OnInit{

  isLoading : boolean = true;
  isLoading2! : boolean ;

  holidayDate! : Date;
  submitted: boolean = false;
  message! :string;

  @Input() 
  eventId!: string;
  date!: Date;

  holidayForm!: FormGroup;
  holidayId!: string;

  constructor(
    private dialogRef: MatDialogRef<AddHolidayComponent>,
    private dataService: DataService,
    private snackBar : MatSnackBar,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public holiday: any,
  ){}

  ngOnInit(): void {
    
    this.holidayForm = this.formBuilder.group({
      holidayOccasion: ['', [Validators.required, Validators.minLength(3)]],
      holidayImage: ['', [Validators.required]],
      holidayDate: ['', [Validators.required]],
        
    });
    
    console.log("This is from ngOnInit",this.holiday);

    if (this.holiday){
      this.isLoading= true;
      const holidayId = this.holiday.id;
      this.dataService.getHolidayById(holidayId).subscribe((holiday) => {
        this.holidayForm.patchValue({
          holidayOccasion: holiday.holidayOccasion,
          holidayImage: holiday.holidayImage,
          holidayDate: new Date(holiday.holidayDate.toDate()), 
        });
      });
      this.isLoading = false;
    }
    
  }

  addHoliday(holidayForm: any) {
    console.log(this.holidayForm);
    this.submitted = true;
    if (this.holidayForm.valid){
      this.isLoading2 = true;
      this.dataService.addHoliday(holidayForm)

    // const collectionInstance= collection(this.firestore, '/Holidays');
    // addDoc(collectionInstance, addHolidayForm.value).then(() => {
    //   console.log('Data saved sucessfully');
    // })
    // .catch((err) => {
    //   console.log(err);
    // })

    this.isLoading2 = false;
    // this.isLoading2 = this.dataService.isLoading2;
    holidayForm.reset()
    
    this.dialogRef.close();
    }
    
  }

  editHolidays() {
    this.submitted = true;

    this.isLoading = true;
    // this.isLoading2 = true;

    if (this.holidayForm.pristine) {
      this.message = "No changes has been done"
      this.snackBar.open(this.message, 'close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      // this.dialogRef.close(); 
      // this.isLoading2 = false;
      this.isLoading = false;
      
      
    }
    else if (this.holidayForm.valid) {
      this.isLoading2 = true;
      const formData = this.holidayForm.value;

      const holidayId = this.holiday.id;

      this.dataService.editHoliday(holidayId, formData).then(() => {
        this.dialogRef.close(); 
        this.snackBar.open('Updated holiday details', 'close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      });
      this.isLoading2 = false;
        
    }
    
  }

}
