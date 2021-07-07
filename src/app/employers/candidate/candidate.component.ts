import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { promoted, Skill } from 'src/app/models/event.model';
import { NgModel } from '@angular/forms';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { environment } from 'src/environments/environment.prod';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.css']
})
export class CandidateComponent implements OnInit {

  @Output() back = new EventEmitter();

  @Input()
  set candidate(candidate: promoted) {
    console.log("inside candidate");
    this.candidateDetail = candidate;
    if(this.candidateDetail != undefined){
      this.getSkill();
    }
  }
  @ViewChild('filterInput',{ static: true }) filterInput: NgModel
  //@ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[]= ['name', 'details', 'experience', 'stars'];
  candidateDetail:promoted;
  skillSub:Subscription;

  constructor(private _http: HttpClient) { }

  ngOnInit() {

  }

  getSkill(){
    this.skillSub = this._http.post<Skill[]>(`${environment.API_URL}/getstudentskill`,
    { uid:this.candidateDetail.uid })
    .subscribe(
      (result) => {
        if (result) {
          let skills = result['skills'];                 //all posts retreived
          this.dataSource = new MatTableDataSource(skills);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
        console.log(Object.keys(result).map(k => result[k]));
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  gobackButton(){
    this.back.emit("doit");
  }

  ngOnDestroy(): void {
    if(this.skillSub != undefined){
      this.skillSub.unsubscribe();
    }
  }


}
