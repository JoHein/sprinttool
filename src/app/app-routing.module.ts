import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HistoriqueComponent } from './historique/historique.component';
import { HomeComponent } from './home/home.component';

import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent},
  { path: 'history', component: HistoriqueComponent}


];

@NgModule({
  imports: [ RouterModule.forRoot(routes, {useHash: true}  ) ],
  exports: [ RouterModule ]
})


export class AppRoutingModule {}
