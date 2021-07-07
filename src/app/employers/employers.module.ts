import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../services/jwt.interceptor';
import { ReviewComponent } from './review/review.component';
import { MaterialModule } from '../material.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TalentComponent } from './talent/talent.component';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ListComponent } from './list/list.component';
import { CandidateComponent } from './candidate/candidate.component';
import { SearchComponent } from './search/search.component';
import { ShortlistComponent } from './shortlist/shortlist.component';
import { MatTooltipModule } from '@angular/material/tooltip';

const appRoutes = [

  { path: '', component: TalentComponent }
  
  ];

@NgModule({
  declarations: [
    ReviewComponent,
    TalentComponent,
    ListComponent,
    CandidateComponent,
    SearchComponent,
    ShortlistComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    RouterModule.forChild(appRoutes),
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
})
export class EmployersModule { }
