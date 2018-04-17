import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ProjectModel } from '../model/projectModel';
import {Message} from 'primeng/api';
import {ChartModule} from 'primeng/chart';
import {DBService} from '../database/postgres.service';
import {Router} from "@angular/router";
import {AccordionModule} from 'primeng/accordion';
import {TableModule} from 'primeng/table';
import {ConfirmationService} from 'primeng/api';

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


  constructor(private db: DBService, private router: Router, private confirmationService: ConfirmationService) {}


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
    if (totalData.value === undefined) {
      totalData.value = 0;
    }
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

    for( let i = dataopentabdone.length -1 ; i >= 0; i--) {

      if (dataopentabdone[i].add_done === null){

        displayDiffDone.push(dataopentabdone[i+1].add_done);
      }else {
        displayDiffDone.push(dataopentabdone[i].add_done);
      }
    }

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

  // verifDiffDoneAdd() : void {
  //
  //   this.dataDiffDoneAdd
  //   for (let i = this.dataDiffDoneAdd.length -1; i>0; i--) {
  //     if (i === this.daysLeft) {
  //       break;
  //     } else {
  //       if (this.dataDiffDoneAdd[i].add_done === null) {
  //         console.log('ENTER IF NULL', this.dataDiffDoneAdd[i] );
  //
  //         this.dataDiffDoneAdd[i].add_done = this.dataDiffDoneAdd[i+1].add_done;
  //
  //         this.db.query('UPDATE sprint_diffdone SET add_done = '+ this.dataDiffDoneAdd[i].add_done +'' +
  //           ' WHERE diffdone_sprintid = '+ this.returnQueryInitSprint[0].sprintid +' and days='+ i +'' );
  //       }
  //     }
  //   }
  //   console.log('after verif', this.dataDiffDoneAdd );
  //
  // }

  deleteSprint(id: number): void {
    console.log('delete Id', id);
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'fa-exclamation-triangle',
      accept: () => {

        this.db.query('DELETE FROM sprint_diffdone WHERE diffdone_sprintid = '+ id +';');
        this.db.query('DELETE FROM sprint_project WHERE project_sprintid = '+ id +';');
        this.db.query('DELETE FROM sprint WHERE sprintid = '+ id +';');

       let index = this.returnListSprint.findIndex(item => item.sprintid === id);

       this.returnListSprint.splice(index,1);

        this.msgs.push({severity: 'info' , summary: 'Success', detail: 'Sprint Deleted'});
      },
      reject: () => {
        this.msgs.push({severity: 'info' , summary: 'Success', detail: 'Declined'});
      }
    });
  }

  navigateToHome() {
    this.router.navigate(['home']);
  }
}
