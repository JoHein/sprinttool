import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ProjectModel } from './model/projectModel';
import {Message} from 'primeng/api';
import {ChartModule} from 'primeng/chart';


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

  calcGraph(): void {
  const dataLabels = [];
  const valueLine = [];

    console.log(this.totalWorkDays);
    console.log(this.daysLeft);
    const totalData = this.projectList.find(entry => entry.name === 'Total');
    valueLine.push(totalData.value);

    let tempValue = totalData.value;
    const tempDone = totalData.done;
    const tempAdd = totalData.add;

    for (let i = this.totalWorkDays; i >= 0; i--) {

      dataLabels.push(i);
      tempValue = Math.floor(tempValue - (tempValue / i));
      valueLine.push(tempValue);

    }

    const diffDoneAdd = (Number(totalData.value) + tempAdd) - tempDone;

    console.log('dataDiff', this.dataDiffDoneAdd );

    if (this.dataDiffDoneAdd === null || this.dataDiffDoneAdd === undefined) {
      this.dataDiffDoneAdd = new Array(this.totalWorkDays - 1);
      this.dataDiffDoneAdd.splice(this.daysLeft - this.totalWorkDays , 1, diffDoneAdd );
      console.log('dataDiffDoneAdd', this.dataDiffDoneAdd);

      localStorage.setItem('dataDiffDoneAdd', JSON.stringify(this.dataDiffDoneAdd));
    } else {
      this.dataDiffDoneAdd.splice(this.daysLeft - this.totalWorkDays , 1, diffDoneAdd );
      console.log('dataDiffDoneAdd', this.dataDiffDoneAdd);

      localStorage.setItem('dataDiffDoneAdd', JSON.stringify(this.dataDiffDoneAdd));

    }


    console.log(totalData.value);

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

  ngOnInit() {

   this.started = JSON.parse(localStorage.getItem('isStarted'));

    if (this.started) {

      this.projectList = JSON.parse(localStorage.getItem('projectList'));
      this.startDate = JSON.parse(localStorage.getItem('startDate'));
      this.endDate = JSON.parse(localStorage.getItem('endDate'));
      this.nbrWeeks = JSON.parse(localStorage.getItem('nbrWeeks'));
      this.nbrProjects = JSON.parse(localStorage.getItem('nbrProjects'));
      this.totalWorkDays = JSON.parse(localStorage.getItem('totalWorkDays'));
      this.dataDiffDoneAdd = JSON.parse(localStorage.getItem('dataDiffDoneAdd'));

      this.daysCalc();
      this.calcGraph();

      // To retreive data var storedNames = JSON.parse(localStorage.getItem("names"));
    }
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
    localStorage.setItem('projectList', JSON.stringify(this.projectList));
    this.calcGraph();
  }

  newNameProject(): void {
    localStorage.setItem('projectList', JSON.stringify(this.projectList));
  }

  initSprint(): void {

    if (!this.started) {

      this.started = true;
      this.numberProject();
      this.dateCalc();

      localStorage.setItem('nbrWeeks', JSON.stringify(this.nbrWeeks));
      localStorage.setItem('nbrProjects', JSON.stringify(this.nbrProjects));

      localStorage.setItem('projectList', JSON.stringify(this.projectList));
      localStorage.setItem('startDate', JSON.stringify(this.startDate));
      localStorage.setItem('endDate', JSON.stringify(this.endDate));
      localStorage.setItem('isStarted', JSON.stringify(this.started));
      localStorage.setItem('totalWorkDays', JSON.stringify(this.totalWorkDays));

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
    localStorage.clear();
    this.projectList = [];
    this.startDate = null;
    this.endDate = null;
    this.daysLeft = null;

    this.msgs = [];
    this.msgs.push({severity: 'info' , summary: 'Success', detail: 'Sprint Finished'});
  }


  dateCalc(): void {

    this.startDate =  new Date();

    const tempendDate = new Date();
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
    const newStartDate = new Date(this.startDate);

    console.log('days calc END', newEndDate);
    console.log('days calc Start', newStartDate);

    const one_day = 1000 * 60 * 60 * 24;
    const diffDates = newEndDate.getTime() - newStartDate.getTime() ;
    this.daysLeft = Math.ceil(diffDates / one_day);
    this.daysLeft = this.daysLeft - (this.nbrWeeks * 2);
  }


  save() {

    let nbrTempProject: number;
    nbrTempProject = Number(this.nbrProjects);
    this.nbrProjects = nbrTempProject + 1 ;

    this.projectList.splice(nbrTempProject, 0, this.project);
    localStorage.setItem('projectList', JSON.stringify(this.projectList));
    localStorage.setItem('nbrProjects', JSON.stringify(this.nbrProjects));

    this.displayDialog = false;

  }

  showDialogToAdd() {
    this.newProject = true;
    this.project = new ProjectModel;
    this.displayDialog = true;
  }


}
