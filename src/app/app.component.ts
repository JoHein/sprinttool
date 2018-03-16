import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ProjectModel } from './model/projectModel';
import {Message} from 'primeng/api';
import {ChartModule} from 'primeng/chart';
import {DBService} from './database/postgres.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  projectList: ProjectModel[];
  nbrProjects: number;
  nbrWeeks: number;
  msgs: Message[] = [];
  started = false;
  startDate: Date;
  endDate: Date;
  daysLeft: number;
  totalWorkDays: number;

  newProject: boolean;
  project: ProjectModel;
  displayDialog: boolean;
  data: any;
  dataDiffDoneAdd: any;
  options: any;
  returnQueryInitSprint: any;
  returnQueryProjectList: any;
  returnQueryDataDiffDone: any;

  constructor(private db: DBService) {}

  ngOnInit() {

    this.returnQueryInitSprint =  this.db.query('select * from sprint order by sprintid DESC LIMIT 1');
    console.log('SprintId',  this.returnQueryInitSprint[0].sprintid);
    if (this.returnQueryInitSprint[0] === undefined) {
      this.started = false;
    } else {
      this.started = this.returnQueryInitSprint[0].status;
    }

    if (this.started) {
      this.returnQueryProjectList =  this.db.query('select * from sprint_project where project_sprintid = '+this.returnQueryInitSprint[0].sprintid);
      this.returnQueryDataDiffDone = this.db.query('select * from sprint_diffdone where diffdone_sprintid = '+this.returnQueryInitSprint[0].sprintid);

      this.projectList = this.reorderProjectTotal(this.returnQueryProjectList);
      this.startDate = this.returnQueryInitSprint[0].startdate;
      this.endDate = this.returnQueryInitSprint[0].enddate;
      this.nbrWeeks = this.returnQueryInitSprint[0].nbrweeks;
      this.nbrProjects = this.returnQueryProjectList.length -1;
      this.totalWorkDays = this.returnQueryInitSprint[0].totalworkdays;
      this.dataDiffDoneAdd = this.returnQueryDataDiffDone;

      this.daysCalc();
      this.calcGraph();

    }
  }

  reorderProjectTotal(list: any): any {
    let tempArrayProject = [];
    let tempTotal:  any;
    for (let i = 0; i< list.length; i ++) {
      if (list[i].name === 'Total') {
        tempTotal = list[i];

      }else{
        tempArrayProject.push(list[i]);
      }
    }
    tempArrayProject.push(tempTotal);
    return tempArrayProject;

  }

  numberProject(): void {

    this.projectList = [];

      for ( let i = 0 ; i < this.nbrProjects; i++) {
        const entry =  new ProjectModel();
        this.projectList.push(entry);
      }
      const total = new ProjectModel();
      total.name = 'Total';
      total.value = 0;
      total.add = 0;
      total.done = 0;
      this.projectList.push(total);

  }

  computeTotal(): void {
    // find Total in projecList

    const result = this.projectList.find(entry => entry.name === 'Total');

    let tempCalcVal = 0;
    let tempCalcAdd = 0;
    let tempCalcDon = 0;

    for ( let i = 0 ; i < this.nbrProjects; i++) {
      if (this.projectList[i].value !== undefined) {
        tempCalcVal += this.projectList[i].value;
      }
      if (this.projectList[i].add !== undefined) {
        tempCalcAdd += this.projectList[i].add;
      }
      if (this.projectList[i].done !== undefined) {
        tempCalcDon += this.projectList[i].done;
      }

    }
    result.value = tempCalcVal;
    result.add = tempCalcAdd;
    result.done = tempCalcDon;
    this.calcGraph();
  }

  saveListProject(): void {

    this.db.query('DELETE FROM sprint_project WHERE project_sprintid = '+ this.returnQueryInitSprint[0].sprintid +';');

    for (let i = 0; i < this.projectList.length; i++) {
     if (this.projectList[i].value === undefined) {
       this.projectList[i].value = 0;
     }
      if (this.projectList[i].add === undefined) {
        this.projectList[i].add = 0;
      }
      if (this.projectList[i].done === undefined) {
        this.projectList[i].done = 0;
      }

      if (this.projectList[i].name !==undefined) {
        const nameproject = '\''  +  this.projectList[i].name + '\'';
        this.db.query('INSERT INTO sprint_project VALUES ('+this.returnQueryInitSprint[0].sprintid+', ' + nameproject + ','+
          this.projectList[i].value +','+ this.projectList[i].add +','+ this.projectList[i].done +')');
      }

    }

    this.db.query('DELETE FROM sprint_diffdone WHERE diffdone_sprintid = '+ this.returnQueryInitSprint[0].sprintid +';');

    for (let i = 0; i < this.dataDiffDoneAdd.length; i++) {
      if (this.dataDiffDoneAdd[i] === undefined) {
        this.dataDiffDoneAdd[i] = null;
      }
      this.db.query('INSERT INTO sprint_diffdone VALUES ' +
        '('+ this.returnQueryInitSprint[0].sprintid +', '+ this.daysLeft + ','+ this.dataDiffDoneAdd[i] +')');

    }

    this.msgs = [];
    this.msgs.push({severity: 'success', summary: 'Success', detail: 'Saved'});
  }

  initSprint(): void {

    if (!this.started) {

      this.started = true;
      this.numberProject();
      this.dateCalc();

      const start = '\''  +  this.startDate + '\'';
      const end = '\''  +  this.endDate + '\'';

    this.returnQueryInitSprint =  this.db.query('INSERT INTO sprint (sprintid, status, nbrweeks, startdate, enddate, totalworkdays) VALUES ' +
        '(DEFAULT, true, '+ this.nbrWeeks +', ' + start + ', '+ end +', '+ this.totalWorkDays +' ) RETURNING sprintid' );


      // To retreive data var storedNames = JSON.parse(localStorage.getItem("names"));
      this.daysCalc();
      this.msgs = [];
      this.msgs.push({severity: 'info', summary: 'Success', detail: 'Sprint Started'});
    } else {
      this.msgs = [];
      this.msgs.push({severity: 'warn', summary: 'Warning', detail: 'Started already!'});
    }

  }

  finishSprint(): void {
    // Clean and save in file;
    this.started = false;
    this.projectList = [];
    this.startDate = null;
    this.endDate = null;
    this.daysLeft = null;
    this.dataDiffDoneAdd = null;
    this.data = null;

    this.db.query('UPDATE sprint SET status = false WHERE sprintid = '+ this.returnQueryInitSprint[0].sprintid +'' );

    this.msgs = [];
    this.msgs.push({severity: 'info' , summary: 'Success', detail: 'Sprint Finished'});
  }


  dateCalc(): void {

    this.startDate =  new Date();
    this.startDate.setHours(1,0,0,0);

    const tempendDate = new Date();
    tempendDate.setHours(1,0,0,0);
    const addWeeks = this.nbrWeeks * 7;
    tempendDate.setDate(tempendDate.getDate() + addWeeks);
    this.endDate = tempendDate;

    // For number of days - weekends
    const one_day = 1000 * 60 * 60 * 24;
    const diffDates = this.endDate.getTime() - this.startDate.getTime() ;
    this.totalWorkDays = Math.round(diffDates / one_day);

    this.totalWorkDays = this.totalWorkDays - (this.nbrWeeks * 2);

  }

  daysCalc(): void {

    const newEndDate = new Date(this.endDate);
    const newTodayDate = new Date();

    const one_day = 1000 * 60 * 60 * 24;

    newEndDate.setHours(1,0,0,0);
    newTodayDate.setHours(1,0,0,0);

    const diffDates = newEndDate.getTime() - newTodayDate.getTime();

    this.daysLeft = Math.ceil(diffDates / one_day);
      console.log('days calc ', this.daysLeft);
      if (  newTodayDate.getDay() == 0) {
        this.daysLeft --;
      } else if (newTodayDate.getDay() == 6) {
        this.daysLeft -= 2;
      }
    this.daysLeft -= this.nbrWeeks * 2;
  }

  calcGraph(): void {

    const totalData = this.projectList.find(entry => entry.name === 'Total');

    const dataLabels = [];
    const valueLine = [];

    for (let i = this.totalWorkDays; i >= 0; i--) {
      dataLabels.push(i);
    }

    let tempValue = totalData.value;

    valueLine.push(totalData.value);
    for (let k = this.totalWorkDays; k > 0; k--) {
      tempValue = Math.floor(tempValue - (tempValue / k ));
      valueLine.push(tempValue);
    }


    const tempDone = totalData.done;
    const tempAdd = totalData.add;

    const diffDoneAdd = (Number(totalData.value) + tempAdd) - tempDone;


    if (this.dataDiffDoneAdd === null || this.dataDiffDoneAdd === undefined) {
      this.dataDiffDoneAdd = new Array(this.totalWorkDays +1 );
    }

    const index = this.totalWorkDays - this.daysLeft;
    this.dataDiffDoneAdd.splice(index, 1, diffDoneAdd );

    this.data = {
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
          data: this.dataDiffDoneAdd,
          fill: false,
          borderColor: '#565656'
        }
      ]
    };

    this.options = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  save() {

    let nbrTempProject: number;
    nbrTempProject = Number(this.nbrProjects);
    this.projectList.splice(nbrTempProject , 0, this.project);
    this.nbrProjects = nbrTempProject + 1 ;

    console.log('Save',this.projectList);
    this.displayDialog = false;

  }

  showDialogToAdd() {
    this.newProject = true;
    this.project = new ProjectModel;
    this.displayDialog = true;
  }

  printPage() {
    window.print();
  }

}
