import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    errormessage: string = '';

    constructor(private authService: AuthService, private toast: ToastService, private router: Router) { }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let url = `${environment.API_URL}/auth/login`;
        return next.handle(request).pipe(catchError(err => {
            //let msg = err.error.message || err.statusText;
            console.log(err);
            console.log(err.error.error);
            if (err.status == 400) {
                this.errormessage = 'malformed request';
                this.toast.notifySnackBar(err.error.error);
                this.authService.logout();
                this.router.navigate(['login']);
            } else if (err.status == 401) {
                this.authService.logout();
                this.router.navigate(['login']);
                this.errormessage = 'Login To Account';
                this.toast.tempSnackBar("Login Failed");
            /*    if(err.error.error == undefined){
                    this.toast.notifySnackBar('Please Login');
                } else {
                    this.toast.notifySnackBar(err.error.error);
                }*/
            } else if (err.status == 402) {
                this.authService.logout();
                this.router.navigate(['login']);
                this.errormessage = 'Payment Required';
                this.toast.notifySnackBar(err.error.error);
            } else if (err.status == 403) {
                if(request.url.includes("/api/auth/register")){
                    this.toast.notifySnackBar(err.error.error);
                    this.errormessage = 'Registration Error';
                } else {
                    this.router.navigate(['login']);
                    this.errormessage = 'Account not Unique';
                    this.authService.logout();
                }
                this.errormessage = 'Account not Unique';
            } else if (err.status == 404) {
                this.errormessage = 'Server not found';
                this.authService.logout();
                this.router.navigate(['login']);
                this.toast.tempSnackBar(this.errormessage); // client side
            } else if (err.status == 408) {
                this.authService.logout();
                this.router.navigate(['home']);
                this.errormessage = 'Request Timeout';
                this.toast.tempSnackBar(this.errormessage);  // client side
            }
            if(err.status !== 200){
                const error = err.error.message || err.statusText;
                return throwError(error);
            }
        }))
    }
}