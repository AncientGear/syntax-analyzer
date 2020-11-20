import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TriploService } from '../../services/triplo/triplo.service';

@Component({
  selector: 'app-triplo',
  templateUrl: './triplo.component.html',
  styleUrls: ['./triplo.component.css']
})
export class TriploComponent implements OnInit {

  tablaTxt = '';
   
  @Input() tokens = [];

  constructor(private activatedRoute: ActivatedRoute, private triploService: TriploService) { }

  ngOnInit(): void {
  }

  download() {
    console.log('Descargar triplo');
    this.activatedRoute.params.subscribe((params) => {
      this.triploService.getPrefix(this.tokens).subscribe((res) => {
        const { prefixArray } = res.data;
          this.triploService.getTriplo(prefixArray).subscribe((triplo) => {
          const element = document.getElementById('downloadXls');
          this.generarTxtTriplo(triplo);
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.tablaTxt));
        });
      });
    });
  }

  generarTxtTriplo(triplo) {
  //   tablaTxt =  `#\t\tDato Objeto\t\tDato Fuente\t\tOperador \n`;

  //   for(let i = 0; i < triplo.length; i++) {
  //       `tablaTxt += ${i}\t\t
  //       tablaTxt += ${triplo[i].from}\t\t
  //       tablaTxt += ${triplo[i].to}\t\t
  //       tablaTxt += ${triplo[i].op}\t\t
  //       tablaTxt += \n`
  //   }
  }
}
