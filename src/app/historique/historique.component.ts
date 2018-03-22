import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ProjectModel } from '../model/projectModel';
import {Message} from 'primeng/api';
import {ChartModule} from 'primeng/chart';
import {DBService} from '../database/postgres.service';
import {Router} from "@angular/router";
import {AccordionModule} from 'primeng/accordion';
import {TableModule} from 'primeng/table';


@Component({
  selector: 'app-history',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})

export class HistoriqueComponent implements OnInit {

  msgs: Message[] = [];
  returnListSprint=[];
  tabActive = [];
  dataOpenTabProject = [];
  dataOpenTabDone = [];
  listDataGraph = [];
  data: any;
  options: any;


  constructor(private db: DBService, private router: Router) {}


  ngOnInit() {
    this.returnListSprint = this.db.query('select * from sprint where status = false order by sprintid DESC LIMIT 20');
    this.dataOpenTabProject = new Array(this.returnListSprint.length);
    this.dataOpenTabDone = new Array(this.returnListSprint.length);
    console.log('array project', this.dataOpenTabProject);
    this.listDataGraph = new Array(this.returnListSprint.length);
  }


  itemClicked(e): void {
    console.log('tabActive', e.index);

    this.dataOpenTabProject[e.index] = ( this.db.query('select * from sprint_project where project_sprintid ='
      +this.returnListSprint[e.index].sprintid));

    this.dataOpenTabDone[e.index] = (this.db.query('select * from sprint_diffdone where diffdone_sprintid = '
      + this.returnListSprint[e.index].sprintid+' order by days ASC'));
    console.log('array project', this.dataOpenTabProject);
    console.log('array sprint_diffdone', this.dataOpenTabDone);

    this.calcGraph(e.index,
      this.returnListSprint[e.index].totalworkdays,
      this.dataOpenTabProject[e.index],
      this.dataOpenTabDone[e.index]);

  }


  calcGraph(index: number, totalWorkDays: number, projectList: any, dataopentabdone: any): void {

    const totalData = projectList.find(entry => entry.name === 'Total');

    const dataLabels = [];
    const valueLine = [];
    let displayDiffDone = [];

    for (let i = totalWorkDays; i >= 0; i--) {
      dataLabels.push(i);
    }

    let tempValue = totalData.value;

    valueLine.push(totalData.value);
    for (let k = totalWorkDays; k > 0; k--) {
      tempValue = Math.floor(tempValue - (tempValue / k ));
      valueLine.push(tempValue);
    }

    console.log('valuline', valueLine);

    console.log('dataopentabdone',dataopentabdone);
    for( let i = dataopentabdone.length -1 ; i >= 0; i--) {
      console.log('dataopentabdone',i);
      displayDiffDone.push(dataopentabdone[i].add_done);
    }

    for (let i = displayDiffDone.length -1; i>0; i--) {

        if (displayDiffDone[i].add_done === null) {
          displayDiffDone[i].add_done = displayDiffDone[i-1].add_done;
        }

    }

    console.log('dataopentabdone',displayDiffDone.length);

 let data = {
      labels: dataLabels,
      datasets: [
        {
          label: 'Values',
          data: valueLine,
          fill: false,
          borderColor: '#4bc0c0'
        },
        {
          label: 'Done',
          data:  displayDiffDone,
          fill: false,
          borderColor: '#565656'
        }
      ]
    };

    this.options = {
      responsive: true,
      maintainAspectRatio: false
    };

    console.log('data',data);

    this.listDataGraph[index] = (data);
  }

  navigateToHome() {
    this.router.navigate(['home']);
  }
}
