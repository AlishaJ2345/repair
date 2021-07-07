import { Component, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Skill } from '../../models/event.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { UsersapiService } from '../../services/api.services';
import { UserSearch } from '../../models/event.model';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    @ViewChild('filterInput',{ static: true }) filterInput: NgModel
    //@ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort,{ static: true }) sort: MatSort;
    dataSource; // = new UserDataSource(this.userService);
    displayedColumns: string[]= ['name', 'details', 'experience', 'stars'];
    searchTerm:string = '';
    picurl:string = localStorage.getItem('pic');
    username:string = localStorage.getItem('name');
    user:any;
    eProfile:any;
    company:string = "";

  constructor(private userService: UsersapiService, private local:LocalStorageService,
    private _http:HttpClient) {  
    this.user = local.retreiveAll();

    if(this.local.retreiveEmployerProfile() != undefined){
      this.eProfile = this.local.retreiveEmployerProfile();
      this.company = this.eProfile.company;
    }
  }

  ngOnInit() {
      this.filterInput
      .valueChanges
      .pipe(
          debounceTime(500),
          distinctUntilChanged()
      )
      .subscribe(term => {
          if (term != undefined || term != ''){
            console.log("search term: "+term);
            this.search(term);
          }
      });
      this.userService.getUsers('S').subscribe(results => {
        if(!results) {
            return;
        }
        console.log(Object.keys(results).map(k => results[k]));
        let array = [];
        results.forEach(skill => {
            let temp = {name: skill.name, details: skill.details, experience: skill.experience, stars: skill.stars};
            array.push(temp)
        })
        this.dataSource = new MatTableDataSource(array);
        this.dataSource.sort = this.sort;
    });
  }
  search(term){
    this.userService.searchUsers(term).subscribe(results => {
        if(!results) {
            return;
        }
        console.log(Object.keys(results).map(k => results[k]));
        this.dataSource = new MatTableDataSource(results);
        this.dataSource.sort = this.sort;
    });
  }


}
