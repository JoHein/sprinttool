import { Injectable } from '@angular/core';
const electron = (<any>window).require('electron');

@Injectable()
export class DBService {

  data: any;

  constructor() { }

  query(sql: string): any {
    this.data = electron.ipcRenderer.sendSync('query', sql);
    return this.data;
  }

  answerDb(): any{
    console.log(electron.ipcRenderer.sendSync('query', 'ping')); // prints "pong"
    // electron.ipcRenderer.on('asynchronous-reply', (event, arg) => {
    //   console.log(arg);
    //   console.log(arg.nbrweeks);
    //   this.data = arg.nbrweeks;
    //
    //   return this.data;
    // });
    // Object {enddate: "2018-04-03T22:00:00.000Z", nbrweeks: 3, sprintid: 1, startdate: "2018-03-12T23:00:00.000Z", status: true}
  }

}


