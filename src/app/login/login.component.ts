import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { UsersapiService } from '../services/api.services';
import { LocalStorageService } from '../services/localStorage.service';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { environment } from 'src/environments/environment';
import { User, eprofile, sprofile } from '../models/event.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ResponsiveService } from '../services/responsive.service';

export interface Type {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterContentInit {

  @Output() accountType = new EventEmitter();

  types: Type[] = [
    { value: 'user', viewValue: 'Student' },
    { value: 'employer', viewValue: 'Employer' }
  ]

  key: any;
  profile: any;
  email: string;
  password: string;
  type: string;
  user: string;
  uid: number;
  name: string;
  picurl: string;
  exp: number;                           // JWT expiry
  verifyed: boolean = false;
  cPassword: string = '';
  c2Password: string = '';
  c3Password: string = '';
  repassword: string = '';
  state: string = 'login';
  selected: string = 'user';
  student_id: string;
  //subscriptions
  loginSub: Subscription;
  resetPassSub: Subscription;
  registerSub: Subscription;
  resetSub: Subscription;
  changesub: Subscription;
  companySub: Subscription;
  student: Subscription;
  employer: Subscription;

  loginaction: boolean = false;
  registeraction: boolean = false;
  changeaction: boolean = false;
  resetaction: boolean = false;
  isLoggedIn: boolean = false;
  noMatch: boolean = false;
  validEmail: boolean = false;
  error: boolean = false;
  errormessage = '';
  legend: string = 'Login';
  screenWidth: string = 'sm';
  token: string;
  passwordLength: number = 7;
  isValidEmail: string = '';
  isValidPass: string = '';
  deviceWidth: number = 280;
  SProfile: sprofile;
  EProfile: eprofile;
  cardStyle = {
    'width': '260px'
  }

  constructor(private authService: UsersapiService, private local: LocalStorageService,
    private router: Router, private _http: HttpClient, private toast: ToastService,
    private auth: AuthService, private cd: ChangeDetectorRef,
    private responsiveService: ResponsiveService) {

  }

  onEmailChange() {
    const validEmailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (validEmailRegEx.test(this.email)) {
      this.isValidEmail = "Valid Email";
    } else {
      this.isValidEmail = "Invalid Email";
    }
  }

  ngAfterContentInit(): void {
    //this.onEmailChange();
    //this.onPassChange();
  }

  gotoRegister() {
    this.router.navigate(['register']);
  }

  onPassChange() {
    const length = this.password.length;
    if (length > this.passwordLength) {
      this.isValidPass = "Valid Password";
    } else {
      this.isValidPass = "Invalid Password";
    }
  }

  ngOnInit() {
    this.checkLogin();
    this.cd.detectChanges();
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth;
      if (isMobile) {
        //console.log('Mobile device detected')
        this.screenWidth = this.responsiveService.screenWidth;
      }
      else {
        //console.log('Desktop detected')
        this.screenWidth = this.responsiveService.screenWidth;
      }
      this.getCardStyle();
    });
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  getCardStyle() {
    let ans = (this.deviceWidth - 32);
    this.cardStyle = {
      'width': `${ans}px`
    }
    if (this.screenWidth == 'sm') {
      this.cardStyle = {
        'width': `${ans}px`
      }
    } else if (this.screenWidth == 'md') {
      this.cardStyle = {
        'width': '500px'
      }
    } else if (this.screenWidth == 'lg') {
      this.cardStyle = {
        'width': '900px'
      }
    }
    let test = {
      'width': `${ans}px`
    }

  }

  checkLogin() {
    this.isLoggedIn = this.auth.loggedIn();
    if (this.isLoggedIn == true) {
      this.legend = 'Logged In'
      if (this.local.retreiveAll() != undefined) {
        this.key = this.local.retreiveAll();
        this.type = this.key.type;
      } else {
        this.legend = 'Log In'
        this.state = 'login';
      }
    } else {
      this.legend = 'Log In'
      this.state = 'login';
    }
  }

  login() {
    if (this.isLoggedIn == true) {
      this.isLoggedIn = false; // do not try to login a logged in user ui
    } else {
      this.onEmailChange();
      this.onPassChange();
      this.loginCall();
    }
  }

  loginCall() {
    this.isLoggedIn = false;
    if (this.email && this.password) {
      if (this.validateEmail(this.email)) {
        this.loginaction = true
        this.authService.loginUser(this.email.toLowerCase(), this.password)
          .subscribe(
            (data) => {
              if (data) {
                //console.log(data);
                //console.log(Object.keys(data).map(k => data[k]));
                this.local.store(data);
                this.email = data.email;
                this.name = data.name;
                this.type = data.type;
                this.uid = data.uid;
                this.exp = +data.exp;
                this.verifyed = data.verifyed;
                this.picurl = data.pic_url;
                this.toast.closeSnackBar();
                this.accountType.emit(this.type);
                this.error = false;
                this.token = data.token;
                this.loginaction = false;
                this.isLoggedIn = true;
                if(this.type == 'user'){
                  this.getStudentProfile();
                }else if (this.type == 'employer'){
                  this.getEmploymentProfile();
                }
              }
            },
            (err: HttpErrorResponse) => {
              this.error = true;
              this.loginaction = false;
              //this.errormessage = `status: ${err}`;
              console.log(err.statusText);
            }
          );
      } else {
        this.toast.notifySnackBar("Please Enter Valid Email");
      }
    } else {
      this.toast.notifySnackBar("Please enter Both Fields");
    }
  }

  getStudentProfile() {
    //console.log(`uid: ${uid} email: ${email}`);
    this.student = this._http.post<sprofile[]>(`${environment.API_URL}/getstudentprofile`, { uid: this.uid, email: this.email })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(Object.keys(result).map(k => result[k]));
            //console.log("s profile "+this.SProfile)
            this.SProfile = result['profile'][0];                 //all posts retreived
            if(this.SProfile == undefined){
              this.router.navigate(['createprofile']);
            }else{
              this.local.storeStudentProfile(this.SProfile);
              setTimeout(() => this.router.navigate(['home']), 1000);
            }
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getEmploymentProfile() {
    //console.log(`uid: ${uid} email: ${email}`);
    this.employer = this._http.post<eprofile>(`${environment.API_URL}/getemployerprofile`, { uid: this.uid, email: this.email })
      .subscribe(
        (result) => {
          if (result) {
            console.log(Object.keys(result).map(k => result[k]));
            this.EProfile = result['profile'][0];                 //all posts retreived
            if(this.EProfile == undefined){
              this.router.navigate(['createprofile']);
            }else{
              this.local.storeEmployerProfile(this.EProfile);
              setTimeout(() => this.router.navigate(['home']), 1000);
            }
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  checkPassMatch() {
    if (this.c2Password == this.c3Password) {
      this.noMatch = false;
    } else {
      this.noMatch = true;
    }
  }

  checkRegPassMatch() {
    if (this.password == this.repassword) {
      this.noMatch = false;
    } else {
      this.noMatch = true;
    }
  }

  validateEmail(email) {
    const emailRegex = /^[-a-z0-9%s_+]+(\.[-a-z0-9%s_+]+)*@(?:[a-z0-9-]{1,63}\.){1,125}[a-z]{2,63}$/i;
    return emailRegex.test(email);
  }

  changePassword() {
    if (this.isLoggedIn) {
      if (this.c2Password == this.c3Password) {
        if (this.cPassword && this.c2Password) {
          //console.log('both feilds have a value');
          if (this.cPassword.length > 6 && this.c2Password.length > 6) {
            this.changeaction = true;
            //console.log('both feilds have more than 6 chars');
            let email = this.key.email;
            let password = this.cPassword;
            let newpass = this.c2Password;
            //send email reset
            this.changesub = this._http.post<User>(`${environment.API_URL}/auth/changepassword`, { email, password, newpass })
              .subscribe(
                (result: User) => {
                  if (result) {
                    this.changeaction = false;
                    let user = result['user'];
                    this.local.store(user);
                    //this.toast.tempSnackBar('Password Changed');
                    this.toast.tempSnackBar('Password Changed');
                    this.error = false;
                    setTimeout(() =>
                      this.router.navigate(['login'])
                      , 3000);
                  }
                },
                (err: HttpErrorResponse) => {
                  this.changeaction = false;
                  if (err.error instanceof Error) {
                    this.toast.tempSnackBar(`${err.status} message: ${err.statusText}`);
                    this.error = true;
                  }
                }
              );

          } else {
            this.toast.notifySnackBar('password must be more than 6 Chars');
          }
        } else {
          this.toast.notifySnackBar('both passwords must be more than 6 Chars');
        }
      } else {
        this.toast.notifySnackBar('new Passwords dont match');
      }
    } else {
      this.toast.tempSnackBar('you must be logged in to Update Password');
      setTimeout(() =>
        this.router.navigate(['login'])
        , 3000);
    }

  }

  register() {
    if (this.email && this.password && this.name) {
      if (!this.noMatch) {
        if (this.validateEmail(this.email)) {
          this.registeraction = true;
          let email = this.email.toLowerCase();
          let password = this.password;
          let name = this.name;
          let student_id = this.student_id;
          name = name.replace(/ /g, "_");
          let type = this.selected;
          //console.log(this.selected);
          this.registerSub = this._http.post<User>(`${environment.API_URL}/auth/register`, { name, student_id, email, password, type })
            .subscribe(
              (result) => {
                if (result) {
                  //this.registeraction = false;
                  //console.log(Object.keys(result).map(k => result[k]));
                  let user = result['user'];
                  this.local.store(user);
                  this.uid = user.uid;
                  this.name = user.name;
                  this.email = user.email;
                  this.type = user.type;
                  this.exp = user.exp;
                  this.verifyed = user.verifyed;
                  this.email = user.email;
                  this.type = user.type;
                  this.toast.tempSnackBar(`Please Complete Profile`);
                  this.router.navigate(['createprofile']);
                  this.accountType.emit(this.type);
                  this.error = false;
                  this.registeraction = false;
                }
              },
              (err: HttpErrorResponse) => {
                // console.log(Object.keys(err).map(k => err[k]));
                //console.log("testerror "+ err.body.);
                this.registeraction = false;
              }
            );
        } else {
          this.toast.notifySnackBar("Please Enter a Valid Email");
        }
      } else {
        this.toast.notifySnackBar("Passwords Do Not Match");
      }
    } else {
      this.toast.notifySnackBar("Please Complete All Fields");
    }
  }

  sendPasswordEmail() {
    //const val = this.resetform.value;
    if (this.validateEmail(this.email)) {
      this.resetaction = true;
      let email = this.email.toLowerCase();
      this.resetSub = this._http.post<User>(`${environment.API_URL}/auth/resetpassword`, { email })
        .subscribe(
          (result) => {
            this.toast.notifySnackBar(`An Email has been sent to \n ${email}`);
            this.resetaction = false;
          }
        ),
        (err: HttpErrorResponse) => {
          // console.log(Object.keys(err).map(k => err[k]));
          //console.log("testerror "+ err.body.);
          this.resetaction = false;
          this.toast.notifySnackBar(`Error Changing Password ${err}`);
        }
    } else {
      this.toast.notifySnackBar("You Must enter a Valid Email");
    }
  }



  getCompany() {
    //const val = this.resetform.value;
    //console.log('user is get employer get profile uid= '+this.uid+ ' type= '+this.type);
    //console.log('token = '+this.token);
    if (this.type == 'employer') {
      this.companySub = this._http.post<eprofile>(`${environment.API_URL}/getemployerprofile`, { uid: this.uid })
        .subscribe(
          (result) => {
            //console.log('1 '+result);
            //console.log(Object.keys(result).map(k => result[k]));
            //console.log('3 '+result['events'][0].company);
            //let company = JSON.stringify(result['profile'][0]);
            //console.log('after stringify ' +company);
            let user = this.local.retreiveAll();
            let temp = {
              email: user.email, name: user.name,
              pic_url: user.pic_url, token: user.token,
              type: user.type, uid: user.uid, company: result['profile'][0].company
            };
            this.local.store(temp);

          }
        )
    } else {
      this.router.navigate(['events']);
    }
  }

  logout() {
    this.toast.tempSnackBar('You are Logged Out!');
    this.accountType.emit('');
    this.local.clear();
    this.isLoggedIn = false;
    this.legend = 'Log In';
    this.auth.loggedIn();
  }

  OnDestroy() {
    this.loginSub.unsubscribe();
    this.resetPassSub.unsubscribe();
    this.registerSub.unsubscribe();
    this.resetSub.unsubscribe();
    this.changesub.unsubscribe();
    this.companySub.unsubscribe();
    this.student.unsubscribe();
    this.employer.unsubscribe();
  }
}
