import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-download-txt',
  templateUrl: './download-txt.component.html',
  styleUrls: ['./download-txt.component.css']
})
export class DownloadTxtComponent implements OnInit {

  txt: string;

  constructor() { }

  ngOnInit(): void {
  }

  download() {

    const element = document.getElementById('download');

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.txt));

  }
}
