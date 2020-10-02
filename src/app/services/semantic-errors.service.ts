import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SemanticErrorsService {

	varGlobal = [];
	varLocal = [];
	errsem = [];
	isLocal:boolean;
	tokens = [{
		line : 1,
		lexeme : 'a',
		token: 'id',
		message: '',
		dataType : 'number',
		context : 'global'
	},
	{
		line : 2,
		lexeme : 'b',
		token: 'id',
		message: '',
		dataType : '',
		context : ''
	},
	{
		line : 3,
		lexeme : 'c',
		token: 'id',
		message: '',
		dataType : 'string',
		context : ''
	},
	{
		line : 4,
		lexeme : 'a',
		token: 'id',
		message: '',
		dataType : '',
		context : ''
	}]
	
	arimeticOperators: {
	id: 'OA',
	options: ['+', '-', '/', '*'],
	counter: 0
	};
	relationalsOperators: {
	id: 'OR',
	options: ['<', '<=', '>', '>=', '!=', '=='],
	counter: 0
	};

	constructor() { 
		this.isLocal = false;
		this.analizaTable();
	}
	analizaTable() {
		this.tokens.forEach(toke => {
			
		});
	}
}
