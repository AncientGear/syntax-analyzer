import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SemanticErrorsService {

  errsem = [];
  numErr: number;
  islocal;

  constructor() {
    this.islocal = false;
    this.numErr = 0;
  }

  analizaTable(tokens) {
    this.errsem = [];
    this.numErr = 0;
    this.islocal = false;

    for (let i = 0; i < tokens.length; i++) {
      const element = tokens[i];


      const token = element.token.slice(0, -1);
      switch (element !== undefined) {
        case token === 'OA' || token === 'OR':
          this.compare(tokens[i - 1], element, tokens[i + 1]);
          break;
        case token === 'DEL':
          switch (element.lexeme) {
            case '{':
              this.islocal = true;
              break;
            case '}':
              this.islocal = false;
              break;
            default:
              break;
          }
          break;
        case token === 'ID':
          console.log(element);

          if (element.dataType === 'undefined') {
            this.numErr++;
            this.errsem.push({
              token: 'ERRSEM'.concat(this.numErr.toString()),
              lexeme: element.lexeme,
              line: element.line,
              message: 'Indefinida la variable'
            });
          }
          break;
      }
    }

    return this.errsem;
  }

  compare(ante, ahora, siguiente) {
    if (ante === undefined || siguiente === undefined) {
      return 0;
    }  else if (ante.dataType === 'undefined' || siguiente.dataType === 'undefined') {
      return 0;
    }  else {
      if (ante.dataType === siguiente.dataType) {
        return 1;
      }  else if (this.islocal === false && (ante.context === 'local' || siguiente.context === 'local')) {
        if (ante.context === 'local') {
          this.numErr++;
          this.errsem.push({
            token: 'ERRSEM'.concat(this.numErr.toString()),
            lexeme: ante.lexeme,
            line: ante.line,
            message: 'Indefinida la variable'
          });
          return 0;
        } else if (siguiente.context === 'local') {
          this.numErr++;
          this.errsem.push({
            token: 'ERRSEM'.concat(this.numErr.toString()),
            lexeme: siguiente.lexeme,
            line: siguiente.line,
            message: 'Indefinida la variable'
          });
          return 0;
        }
      }  else {
        this.numErr++;
        this.errsem.push({
          token: 'ERRSEM'.concat(this.numErr.toString()),
          lexeme: ante.lexeme + ahora.lexeme + siguiente.lexeme,
          line: ahora.line,
          message: 'Incompatibilidad de tipos'
        });
      }
    }
  }
}
