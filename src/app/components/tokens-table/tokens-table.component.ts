import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tokens-table',
  templateUrl: './tokens-table.component.html',
  styleUrls: ['./tokens-table.component.css']
})
export class TokensTableComponent implements OnInit {

  @Input() tokens = [];

  constructor() { }

  ngOnInit(): void {
  }

}
