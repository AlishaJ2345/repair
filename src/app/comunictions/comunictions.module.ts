import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ChatComponent } from './chat/chat.component';
import { WebrtcComponent } from './webrtc/webrtc.component';
import { MaterialModule } from '../material.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DndDirective } from './dnd.directive';
import { JwtInterceptor } from '../services/jwt.interceptor';
import { MatIconModule } from '@angular/material/icon';

const appRoutes = [

  { path: '', component: ChatComponent }
  
  ];

@NgModule({

  declarations: [
    ChatComponent,
    WebrtcComponent,
    DndDirective
  
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes),
    FormsModule,
    HttpClientModule,
    MaterialModule,
    MatButtonToggleModule,
    MatIconModule,
  ],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
})
export class ComunictionsModule { }
