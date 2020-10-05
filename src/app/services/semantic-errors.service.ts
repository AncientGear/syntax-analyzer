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
    for (let i = 0; i < tokens.length; i++) {
      const element = tokens[i];
      switch (element) {
        case element.token === 'OA' || element.token === 'OR':
          this.compare(tokens[i - 1], element, tokens[i + 1]);
          break;
        case element.token === 'DEL':
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
        case element.token === 'ID':
          if (element.dataType === undefined) {
            this.numErr++;
            this.errsem.push({
              message: 'ERRSEM'.concat(this.numErr.toString()),
              lexeme: element.lexeme,
              line: element.line,
              description: 'Indefinida la variable'
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
    }  else if (ante.dataType === undefined || siguiente.dataType === undefined) {
      return 0;
    }  else {
      if (ante.dataType === siguiente.dataType) {
        return 1;
      }  else if (this.islocal === false && (ante.context === 'local' || siguiente.context === 'local')) {
        if (ante.context === 'local') {
          this.numErr++;
          this.errsem.push({
            message: 'ERRSEM'.concat(this.numErr.toString()),
            lexeme: ante.lexeme,
            line: ante.line,
            description: 'Indefinida la variable'
          });
          return 0;
        } else if (siguiente.context === 'local') {
          this.numErr++;
          this.errsem.push({
            message: 'ERRSEM'.concat(this.numErr.toString()),
            lexeme: siguiente.lexeme,
            line: siguiente.line,
            description: 'Indefinida la variable'
          });
          return 0;
        }
      }  else {
        this.numErr++;
        this.errsem.push({
          message: 'ERRSEM'.concat(this.numErr.toString()),
          lexeme: ante.lexeme + ahora.lexeme + siguiente.lexeme,
          line: ahora.line,
          description: 'Incompatibilidad de tipos'
        });
      }
    }
  }
}
