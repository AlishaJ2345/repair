import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { environment } from '../../../environments/environment.prod';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { promoted } from 'src/app/models/event.model';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ToastService } from 'src/app/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() selected = new EventEmitter();

  dataSource: MatTableDataSource<promoted>;
  displayedColumns: string[] = ['pic_url', 'name', 'email', 'uni', 'qual', 'major', 'cv_url', 'Actions'];
  searchKey: string;
  gettingList: boolean = false;
  selectedRow: promoted;
  user:any;
  eProfile:any;
  company:string = "";
  bycompanySub:Subscription;

  constructor(private _http: HttpClient, private local:LocalStorageService,
    private toast:ToastService) { 
    this.user = local.retreiveAll();

    if(this.local.retreiveEmployerProfile() != undefined){
      this.eProfile = this.local.retreiveEmployerProfile();
      this.company = this.eProfile.company;
    }
  }

  ngOnInit() {
    this.getPromoted();
  }

  inspect(index) {
    console.log("inspect clicked " + this.dataSource.data[index]);
    console.log("inspect clicked " + index);
    this.selectedRow = this.dataSource.data[index];
    console.log("seleceted " + this.selectedRow.uid);
    this.selected.emit(this.selectedRow);
  }

  onSearchClear() {
    this.searchKey = '';
    this.applyFilter();
  }

  applyFilter() {
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  }


  getPromoted() {
    this.gettingList = true;
    this._http.post<promoted[]>(`${environment.API_URL}/promoted`, {})
      .subscribe(
        (result) => {
          //this.events = result;
          //console.log(result);
          let profiles = result['profiles'];
          console.log(Object.keys(result).map(k => result[k]));
          this.dataSource = new MatTableDataSource(profiles);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.gettingList = false;
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  //eid, sid, company, scanner_email, email, name, picture, stars, notes, tag, major, degree, uni, location, interviewed, position
  storeCandidate(index) {
    let candy = this.dataSource.data[index];
    this.bycompanySub = this._http.post(`${environment.API_URL}/createcandidate`,
      {
        eid: this.eProfile.pid, sid: candy.uid, company: this.company, scanner_email: this.user.email,
        email: candy.email, name: candy.name, picture: candy.pic_url, stars: "", notes: "",
        tag: "", major: candy.major, degree: candy.qual, uni: candy.uni,
        location: 'NZ', interviewed: false, position: ""
      })
      .subscribe(
        (result) => {
          this.toast.tempSnackBar(candy.name + " Added to Candidates");
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

}
