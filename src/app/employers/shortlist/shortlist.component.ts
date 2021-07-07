import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { candidate } from 'src/app/models/event.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-shortlist',
  templateUrl: './shortlist.component.html',
  styleUrls: ['./shortlist.component.css']
})
export class ShortlistComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() selected = new EventEmitter();

  dataSource: MatTableDataSource<candidate>;
  displayedColumns: string[] = ['picture', 'name', 'email', 'uni', 'degree', 'major', 'stars', 'notes', 'tag', 'position',
  'scanner_email', 'interviewed', 'company',  'saved', 'Actions'];
  searchKey: string;
  gettingList: boolean = false;
  selectedRow: candidate;
  user:any;
  eProfile:any;
  company:string = "";

  constructor(private _http: HttpClient, private local:LocalStorageService,
    private toast:ToastService) {
      this.user = local.retreiveAll();
      if(this.local.retreiveEmployerProfile() != undefined){
        this.eProfile = this.local.retreiveEmployerProfile();
        this.company = this.eProfile.company;
      }
     }

  ngOnInit() {
    this.getShortListed();
  }

  inspect(index) {
    console.log("inspect clicked " + this.dataSource.data[index]);
    console.log("inspect clicked " + index);
    this.selectedRow = this.dataSource.data[index];
    //console.log("seleceted " + this.selectedRow.uid);
    //this.selected.emit(this.selectedRow);
  }

  onSearchClear() {
    this.searchKey = '';
    this.applyFilter();
  }

  applyFilter() {
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  }


  getShortListed() {
    this.gettingList = true;
    this._http.post<candidate[]>(`${environment.API_URL}/getcandidate`, {company:this.company})
      .subscribe(
        (result) => {
          //this.events = result;
          //console.log(result);
          let profiles = result['candidates'];
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
  /*
  storeCandidate(index) {
    let candy = this.dataSource.data[index];
    this._http.post(`${environment.API_URL}/createcandidate`,
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
  }*/


}
