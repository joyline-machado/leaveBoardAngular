import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted: boolean = false;
  hide = true;
  message!: string;

  // email!: string;
  // password!: string;

  login: boolean = true;
  forgot: boolean = false;

  forgotForm!: FormGroup;


  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private afAuth: AngularFireAuth
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, this.noSpaceAllowed]],
      password: ['', [Validators.required, this.noSpaceAllowed]],
    });

    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    })

  }

  ngOnInit(): void {
    const role = localStorage.getItem('Role');
    if (role && role === 'ADMIN' || role && role === 'EMPLOYEE') {
      this.router.navigate(['dashboard'])
    }
    else {
      this.router.navigate(['login'])
    }
  }

  onLogin(loginForm: any) {
    console.log(this.loginForm)
    this.submitted = true;
    if (this.loginForm.valid) {
      let email = loginForm.value.email;
      let password = loginForm.value.password;

      this.auth.login(email, password).then(() => {
        this.message = this.auth.message

      });

    }

    // email = '';
    // password = '';


  }

  noSpaceAllowed(control: AbstractControl): ValidationErrors | null {
    if (control.value != null && control.value.indexOf(' ') != -1) {
      return { noSapaceAllowed: true }
    }
    return null;
  }

  onForgotPassword(forgotForm: any) {
    this.submitted = true;
    if (this.forgotForm.valid){
      let email = forgotForm.value.email;

      console.log(email)
  
      this.auth.forgotPassword(email);

      this.forgot = false;
      this.login = true
    }
   
    
  }

   



}
