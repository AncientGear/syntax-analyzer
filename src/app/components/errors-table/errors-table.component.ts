import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-errors-table',
  templateUrl: './errors-table.component.html',
  styleUrls: ['./errors-table.component.css']
})
export class ErrorsTableComponent implements OnInit {

  @Input() tokenErrors = [];

  constructor() { }

  ngOnInit(): void {
  }

}
