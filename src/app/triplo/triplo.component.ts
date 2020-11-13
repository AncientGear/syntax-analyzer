import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TriploService } from '../services/triplo/triplo.service';

@Component({
  selector: 'app-triplo',
  templateUrl: './triplo.component.html',
  styleUrls: ['./triplo.component.css']
})
export class TriploComponent implements OnInit {

  @Input() tokens = [];

  constructor(private activatedRoute: ActivatedRoute, private triploService: TriploService) { }

  ngOnInit(): void {
  }

  download() {
    console.log('Descargar triplo');
    this.activatedRoute.params.subscribe((params) => {
      this.triploService.getTriplo(this.tokens).subscribe((res) => {
        console.log(res);
      });
    });
  }
}
