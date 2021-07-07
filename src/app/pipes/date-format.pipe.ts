import { Pipe, PipeTransform } from '@angular/core';
//import * as moment_ from 'moment';
import * as moment_ from 'moment-mini-ts'

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    
    if(value){
      return moment_(value).format('MMMM Do YYYY, h:mm a');
    }
    return null;
  }

}
