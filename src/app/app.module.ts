import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import {SplitButtonModule} from 'primeng/splitbutton';
import {GrowlModule} from 'primeng/growl';
import {DialogModule} from 'primeng/dialog';
import {TableModule} from 'primeng/table';
import {CardModule} from 'primeng/card';
import {ChartModule} from 'primeng/chart';

import { AppRoutingModule } from './app-routing.module';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {DBService} from './database/postgres.service';
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [

    BrowserModule,
    FormsModule,
    SplitButtonModule,
    GrowlModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DialogModule,
    TableModule,
    CardModule,
    ChartModule,

  ],
  providers: [DBService],
  bootstrap: [AppComponent]
})
export class AppModule { }
