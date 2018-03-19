import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ProjectModel } from '../model/projectModel';
import {Message} from 'primeng/api';
import {ChartModule} from 'primeng/chart';
import {DBService} from '../database/postgres.service';
import {Router} from "@angular/router";
import {PanelModule} from 'primeng/panel';


@Component({
  selector: 'app-history',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})

export class HistoriqueComponent implements OnInit {

  msgs: Message[] = [];
  returnListSprint=[];
  constructor(private db: DBService, private router: Router) {}


  ngOnInit() {
    this.returnListSprint = this.db.query('select * from sprint order by sprintid DESC LIMIT 20');
  }


  navigateToHome() {
    this.router.navigate(['home']);
  }

}
