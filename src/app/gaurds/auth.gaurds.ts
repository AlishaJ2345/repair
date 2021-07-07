import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService  } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private auth:AuthService, private toast:ToastService) { }

    canActivate(): boolean {
        if (this.auth.loggedIn()) {
          return true;
        }  else {
          localStorage.removeItem('key');
          this.router.navigate(['login']);
          this.toast.tempSnackBar('Navigation is Blocked \n Please login')
          return false;
        }
    }
}