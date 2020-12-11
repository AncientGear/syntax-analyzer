import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TriploService } from '../../services/triplo/triplo.service';
import { AssemblyService } from "../../services/assembly.service";


@Component({
  selector: 'app-triplo',
  templateUrl: './triplo.component.html',
  styleUrls: ['./triplo.component.css']
})
export class TriploComponent implements OnInit {

  tablaTxt = '';
  tablaAssembly = '';

  @Input() tokens = [];

  constructor(private activatedRoute: ActivatedRoute, private triploService: TriploService, private assemblyService: AssemblyService) { }

  ngOnInit(): void {
  }

  download() {
    this.tablaTxt = '';
    this.tablaAssembly = '';
    this.activatedRoute.params.subscribe((params) => {
      this.triploService.getPrefix(this.tokens).subscribe((res) => {
        const { prefixArray } = res.data;
        this.triploService.getTriplo(prefixArray).subscribe(async (triplo) => {
          const element = document.getElementById('download-triplo');

          await this.generarTxtTriplo(triplo.triploArr);
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.tablaTxt));

          this.tablaAssembly = "";
          this.tablaAssembly = this.assemblyService.getAssemble(this.tokens);
          const element2 = document.getElementById('download-assembly');

          element2.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.tablaAssembly));
        });
      });
    });
  }

  generarTxtTriplo(triplo) {
    this.tablaTxt = `#\t\tDato Objeto\t\tDato Fuente\t\tOperador \n`;

    for (let i = 0; i < triplo.length; i++) {
      this.tablaTxt += `${i}\t\t${triplo[i].to}\t\t\t${triplo[i].from}\t\t\t${triplo[i].op}\t\t\n`;
    }
  }
}
