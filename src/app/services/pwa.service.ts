import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  promptEvent:any;

  constructor(private swUpdate: SwUpdate, private snackbar: MatSnackBar) { 
  /*  swUpdate.available.subscribe(update => {
      const snack = this.snackbar.open('Update Available', 'Reload');
      snack.onAction()
        .subscribe(() => {
          this.swUpdate.activateUpdate()
            .then(() => { 
              window.location.reload();
            });
        });
    }); */

    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.promptEvent = event;
    });
  }
}