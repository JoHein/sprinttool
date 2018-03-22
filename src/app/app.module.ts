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
import {PanelModule} from 'primeng/panel';
import {AccordionModule} from 'primeng/accordion';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';


import {HistoriqueComponent} from './historique/historique.component';
import {HomeComponent} from './home/home.component';

import { AppRoutingModule } from './app-routing.module';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {DBService} from './database/postgres.service';
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    HistoriqueComponent,
    HomeComponent
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
    PanelModule,
    AccordionModule,
    ConfirmDialogModule

  ],
  providers: [DBService,ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
