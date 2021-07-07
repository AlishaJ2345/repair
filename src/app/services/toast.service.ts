import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

 
@Injectable({
  providedIn: 'root'
})
export class ToastService {
 
  constructor(private snackbar: MatSnackBar) { 

  }

  tempSnackBar(message:string){
    this.snackbar.open(message, undefined, {
        duration: 3000
    });
  }

  notifySnackBar(message:string){
    const snack = this.snackbar.open(message, 'OK');
  /*  snack.onAction()
      .subscribe(() => {

      }); */
  }

  permSnackBar(message:string){
    this.snackbar.open(message);
  }
  
  closeSnackBar(){
      this.snackbar.dismiss();
  }
}