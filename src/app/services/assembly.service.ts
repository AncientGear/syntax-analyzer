import {
    Injectable
}
from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { exit } from 'process';
@Injectable({ providedIn: 'root' }) export class AssemblyService {

    auxassembly= [];
	cont = 0;

    constructor(private http: HttpClient) {}

    getAssemble(triplo) {
        console.log(triplo);
		triplo.forEach(trip => {	
			// console.log("line" , this.cont);
					
			switch (trip.op) {
				case '>=':
					console.log("MAYOR-IGUAL");
					// this.mov(trip);
					break;
				case '<=':
					console.log("MENOR-IGUAL");
					// this.mov(trip);
					break;
				case '=':
					console.log("IGUAL");
					this.mov(trip);
					break;
				case '+':
					console.log("SUMA");

					break;
				default:
					if(Number.parseInt(trip.op)){
						console.log(trip.from,trip.to , "numero");
					}
					break;
			}
			this.cont ++;
		});
		console.log("action", this.auxassembly);	
	}
	
	mov(trip){
		if(this.compto(trip.to) || this.compto(trip.to)){
			console.log("ALGO VIENE MAL EN EL TRIPLO");			
			return exit(0);
		}
		this.auxassembly.push('MOV AH,'+ trip.from);
	}

	compto(to){
		switch (to) {
			case 'TR1':
				return true;
			case 'TR2':
				return true;
			case 'TR3':
				return true;	
			case 'TR4':
				return true;
			case 'TR5':
				return true;
			case 'TR5':
				return true;
			default:
				return false;
		}
	}
}
