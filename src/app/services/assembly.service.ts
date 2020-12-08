import {
    Injectable
}
from '@angular/core';

import { HttpClient } from '@angular/common/http';
@Injectable({ providedIn: 'root' }) export class AssemblyService {

    assembly: [];
    possible = {

	};
	cont = 0;

    constructor(private http: HttpClient) {}

    getAssemble(triplo) {
        console.log(triplo);
		triplo.forEach(trip => {	
			console.log("line" , this.cont);
					
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
					// this.mov(trip);
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
	}
	
	mov(trip){
		
	}
}
