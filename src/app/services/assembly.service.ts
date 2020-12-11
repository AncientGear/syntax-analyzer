import {
    Injectable
}
from '@angular/core';

import { HttpClient } from '@angular/common/http';
@Injectable({ providedIn: 'root' }) export class AssemblyService {

	auxassembly= [];
	generaEtiq = [];
	linea = 0;
	multi = false;
	divi = false;
	modul = false;
	assembly = '';
	valor = false;
	temporales = '';

    constructor(private http: HttpClient) {}

    getAssemble(triplo) {
		console.log('triplo\n',triplo);
		var compara = 0, mayor = 0, mayorigual = 0;
		triplo.forEach(trip => {
			// console.log("line" , this.linea);
			switch (trip.op) {
				case '=':
					// console.log("IGUAL");
					this.mov(trip);
					break;
				case '+':
					// console.log("SUMA");
					this.add(trip, 'ADD');
					break;
				case '-':
					// console.log("SUMA");
					this.add(trip, 'SUB');
					break;
				case '*':
					// console.log("MULTIP");
					this.mul(trip);
					break;
				case '/':
					// console.log("División");
					this.div(trip);
					break;
				case '%':
					// console.log("División");
					this.div(trip);
					break;
				case '==':
					// console.log("COMPARACIÓN");
					this.CMP(trip);
					compara = 2;
					break;
				case '>':
					// console.log("MAYOR 0 MENOR");
					this.CMP(trip);
					mayor = 2;
					break;
				case '<':
					// console.log("MENOR");
					this.CMP(trip);
					mayor = 2;
					break;
				case '>=':
					// console.log("MAYOR IGUAL QUE");
					this.CMP(trip);
					mayorigual = 2;
					break;
				case '<=':
					// console.log("MENOR IGUAL QUE");
					this.CMP(trip);
					mayorigual = 2;
					break;
				default:
					if(Number.parseInt(trip.pos)){
						if(trip.from === 'JMP' || trip.to === 'JMP' || trip.id === 'JMP'){
							this.salto(trip);
						}
						else if(compara !== 0){
							compara = compara-1;
							this.comparacion (trip, 'EQ');
						}else if(mayor !== 0){
							mayor = mayor-1;
							this.comparacion(trip, 'GT');
						}else if(mayorigual !== 0){
							mayorigual = mayorigual-1;
							this.comparacion(trip, 'LE');
						}
					}
					break;
			}
			this.linea++;
		});
		this.etiquetas();
		// console.log("auxssembly", this.auxassembly);
		this.elavoraString()
		console.log("Assembly \n", this.assembly);
		return this.assembly;
	}

	mov(trip){
		if(this.compfrom(trip.to) && !this.compfrom(trip.from) && !this.valor){
			this.auxassembly.push({linea : this.linea, msg: `MOV AX, ${trip.from};`});
			this.valor = true;
			// this.auxassembly.push({linea : this.linea, msg: `MOV ${trip.to}, AL;`})
		}
		else  if(this.valor){
			// this.auxassembly.push({linea : this.linea, msg: `MOV AX, ${trip.from};`});
			this.auxassembly.push({linea : this.linea, msg: `MOV ${trip.from}, AX;`})
			this.valor = false;
			this.temporales = `${trip.from}`;
		}
		else if(this.compfrom(trip.to) && !this.compfrom(trip.from)){
			if(this.multi){
				this.auxassembly.push({linea : this.linea, msg: `MOV ${trip.to}, AX;`})
				this.multi = false
			}
			else if(this.divi){
				this.auxassembly.push({linea : this.linea, msg: `MOV ${trip.to}, AL;`})
				this.divi = false;
			}
			else if(this.modul){
				this.auxassembly.push({linea : this.linea, msg: `MOV ${trip.to}, AH;`})
				this.divi = false;
			}
			else
			this.auxassembly.push({linea : this.linea, msg: `MOV AL, ${trip.to},;`})
		}
		else
			this.auxassembly.push({linea : this.linea, msg: `MOV AX, ${trip.from};`});
	}
	mul(trip){
		var temp = this.auxassembly[this.auxassembly.length - 1].msg.split(" ");
		this.auxassembly[this.auxassembly.length - 1].msg = `${temp[0]} AL, ${temp[2]}`
		this.auxassembly.push({linea : this.linea, msg: `MOV BL, ${trip.from};`});
		this.auxassembly.push({linea : this.linea, msg: `MUL BL;`});
		this.multi = true;
	}
	div(trip){
		var temp = this.auxassembly[this.auxassembly.length - 1].msg.split(" ");
		this.auxassembly[this.auxassembly.length - 1].msg = `${temp[0]} AX, ${temp[2]}`
		this.auxassembly.push({linea : this.linea, msg: `MOV BL, ${trip.from};`});
		this.auxassembly.push({linea : this.linea, msg: `DIV BL;`});
		this.modul = true;
	}
	add(trip, string){
		this.auxassembly.push({linea : this.linea, msg: `${string} AX, ${trip.to};`});
	}
	CMP(trip){
		this.auxassembly.push({linea : this.linea, msg: `CMP AX, ${this.temporales};`});
		this.temporales = '';
	}
	comparacion(trip, string){
		if(trip.from === 'FALSE' || trip.from === 'false'){
			this.auxassembly.push({linea : this.linea, msg: `JMP ET${trip.pos+1};`});
			this.generaEtiq.push(trip.pos+1);
		}else if(trip.from === 'TRUE' || trip.from === 'true'){
			this.auxassembly.push({linea : this.linea, msg: `${string} ET${trip.pos-3};`});
			this.generaEtiq.push(trip.pos-3);
		}else
			console.log('AQUI PASO ALGO');
	}
	salto(trip){
		this.auxassembly.push({linea : this.linea, msg: `JMP ET${trip.op};`});
		this.generaEtiq.push(trip.op);
	}
	etiquetas(){
		const dataArr = new Set(this.generaEtiq);
		let result = [...dataArr];
		// console.log('Generador de Etiquetas', result);
		this.auxassembly.push({linea : this.linea, msg: `END`});
		this.generaEtiq.forEach(element => {
			for (let i = 0; i < this.auxassembly.length; i++) {
				if(element == this.auxassembly[i].linea){
					var temp = this.auxassembly[i];
					this.auxassembly[i] = {linea: temp.linea, etique:`ET${element}:`, msg:`${temp.msg}`};
					this.generaEtiq.splice(element, 1);
				}
			}
		});
	}

	compto(to){
		switch (to) {
			case 'TR1':
				return (true);
			case 'TR2':
				return true;
			case 'TR3':
				return true;
			case 'TR4':
				return true;
			case 'TR5':
				return true;
			case 'TR6':
				return true;
			default:
				return false;
		}
	}
	compfrom(from){
		switch (from) {
			case 'T0':
				return true;
			case 'T1':
				return true;
			case 'T2':
				return true;
			case 'T3':
				return true;
			case 'T4':
				return true;
			case 'T5':
				return true;
			case 'T6':
				return true;
			default:
				break;
		}
	}

	elavoraString(){
		this.assembly += `#  Etiqueta\tCodigo\n`
		this.auxassembly.forEach(element => {
			if(element.etique)
				this.assembly += `${element.linea}\t${element.etique}\t${element.msg}\n`
			else
				this.assembly += `${element.linea}  \t\t${element.msg}\n`
		});
	}
}
