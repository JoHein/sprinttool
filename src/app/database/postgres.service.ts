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

}


