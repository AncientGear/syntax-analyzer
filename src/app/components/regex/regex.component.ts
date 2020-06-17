import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-regex',
  templateUrl: './regex.component.html',
  styleUrls: ['./regex.component.css']
})
export class RegexComponent implements OnInit {
  code = [];
  tokensForTxt = [];
  txt: string;
  tokens = [];
  tokenErrors = [];
  possibleTokens = {
    dateTypes: {
      id: 'TD',
      options: ['int', 'char', 'float'],
      counter: 0
    },
    arimeticOperators: {
      id: 'OA',
      options: ['+', '-', '/', '*'],
      counter: 0

    },
    relationalsOperators: {
      id: 'OR',
      options: ['<', '<=', '>', '>=', '!=', '=='],
      counter: 0
    },
    conditionalOperators: {
      id: 'IC',
      options: ['if', 'else', 'swhitch', 'case', 'default'],
      counter: 0
    },
    delimiters: {
      id: 'DEL',
      options: ['{', '}', '(', ')', '[', ']'],
      counter: 0
    },
    miscellaneous: {
      id: 'SEP',
      options: [',', ';', ':'],
      counter: 0
    },
    assignationOperator: {
      id: 'AS',
      options: ['='],
      counter: 0
    },
    notFound: {
      id: 'NF',
      counter: 0
    },
    identifier: {
      id: 'ID',
      counter: 0,
      options: []
    }
  };
  errors = {
    TD: 'Type Error',
    OA: 'Operator Error',
    OR: 'Operator Error',
    ID: 'Identifier Error',
    CNE: 'Invalid Number',
    AS: 'Assignation Operator Error',
    SEP: 'Miscellaneous Error',
    DEL: 'Delimiter Error',
    IC: 'Condition Error',
    IR: 'Condition Error',
    NF: 'Not Found'
  };
  charRegEx = /[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,-]*/;
  vairablesRegEx = /^[a-zA-Z][\w$]*/;
  numbersRegEx = /[\d]*[.]*[\d]*/;
  arimeticOpRegEx = /^[+-\/*]/;
  constructor() { }

  ngOnInit(): void {}

  uploadFile(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.code = [];

    if (!file) {
      return;
    }
    const secondThis = this;
    const reader = new FileReader();
    // tslint:disable-next-line: no-shadowed-variable
    reader.onload = (event: any) => {
      const contend = event.target.result;
      secondThis.showTxtContent(contend);
      secondThis.keepCode(contend);
    };
    reader.readAsText(file);
  }

  async analyzeCode() {
    this.inizializeCounters();
    // tslint:disable-next-line: prefer-for-of
    let line = 1;
    for (let i = 0; i < this.code.length; i++) {

      const code = this.code.shift();

      if (this.isDeclaration(code)) {
        await this.declaration(code, line);
      } else if (this.isAssignation(code)) {
        await this.assignation(code, line);
      }
      if (this.code === undefined) {
        break;
      }
      line++;
      i--;
      this.tokensForTxt.push('\n');
    }

    for (let i = 0; i < this.tokens.length; i++) {
      if (JSON.stringify(this.tokens[i]) === '{}') {
        delete this.tokens[i];
        i--;
      }
    }
    console.log(this.tokens);

    this.txt = this.tokensForTxt.join(' ');

    this.download();
  }


  download() {
    const element = document.getElementById('download');

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.txt));

  }

  inizializeCounters() {
    const tokens = this.possibleTokens;

    tokens.arimeticOperators.counter = 0;
    tokens.assignationOperator.counter = 0;
    tokens.conditionalOperators.counter = 0;
    tokens.dateTypes.counter = 0;
    tokens.delimiters.counter = 0;
    tokens.miscellaneous.counter = 0;
    tokens.relationalsOperators.counter = 0;
    tokens.notFound.counter = 0;
    tokens.identifier.counter = 0;
  }

  async declaration(code: string, line: number) {
    let wordToCompare = '';

    let type = await this.verifyType(code);
    type = this.possibleTokens.dateTypes.options[type] || code.split(' ')[0];

    await this.generateToken('dateTypes', type, line);
    let codeToCompare = code.split(type)[1].replace(/ /g, '');

    while (codeToCompare.match(/[\w$_(){}["!#%&\/?='¡¿*΅~^`<>|°¬,;-]+/)) {

      wordToCompare = codeToCompare.match(/[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,-]+/)[0];
      codeToCompare = codeToCompare.replace(wordToCompare, '');
      if(codeToCompare.length === 0 ){
        break;
      }

      await this.postIdentifier(wordToCompare, line);

      wordToCompare = codeToCompare.match(/./)[0];
      codeToCompare = codeToCompare.replace(/./, '');

      if(codeToCompare.length === 0 ){
        break;
      }

      await this.postAssignation(wordToCompare, line);

      wordToCompare = codeToCompare.match(/[a-zA-Z0-9$_()\.{}["!#%&\/?'¡¿*΅~^`<>|°¬-]+/)[0];
      const possibleColon = wordToCompare.split('')[0];

      if(possibleColon === '\'') {
        await this.postChar(wordToCompare, line);
      } else if (Number(wordToCompare)) {
        await this.postNumber(wordToCompare, line);
      } else {
        await this.postIdentifier(wordToCompare, line);
      }
      codeToCompare = codeToCompare.replace(wordToCompare, '');
      wordToCompare = codeToCompare.match(/./)[0];

      if(codeToCompare.length === 0 ){
        break;
      }

      if (wordToCompare !== ';') {
        codeToCompare = codeToCompare.replace(/./, '');
        await this.postColon(wordToCompare, line);
      } else {
        this.postSemiColon(wordToCompare, line);
        break;
      }
    }
  }

  async assignation(code: string, line: number) {

    let codeToCompare = code.replace(/[ ]/g, '');
    let wordToCompare = codeToCompare.match(/[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬-]+/)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');
    console.log('1' + wordToCompare);

    await this.postIdentifier(wordToCompare, line);

    wordToCompare = codeToCompare.match(/[\a-zA-Z$_(){}["!#%&=?'¡¿*΅~^`<>|°¬-]+/)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');

    await this.postAssignation(wordToCompare, line);

    while (codeToCompare.match(/[\w$_(){}["!#%&\/?='¡¿*΅~^`<>|°¬,;-]+/)) {
      wordToCompare = codeToCompare.match(/[\w$_(){}["!#%&?'¡¿΅~^`<>|°¬]+/)[0];

      if (Number(wordToCompare)) {
        console.log('number');

        await this.postNumber(wordToCompare, line);
      } else{
        await this.postIdentifier(wordToCompare, line);
      }

      codeToCompare = codeToCompare.replace(wordToCompare, '');

      if(codeToCompare.length === 1){
        wordToCompare = codeToCompare.match(/./)[0];

        await this.postSemiColon(wordToCompare, line);
        break;
      }

      if(codeToCompare.length > 0) {
        wordToCompare = codeToCompare.match(/[+-/*]+/)[0];
        codeToCompare = codeToCompare.replace(wordToCompare, '');

        if (wordToCompare) {
          await this.postArimeticOperator(wordToCompare, line);
        } else {
          await this.postSemiColon(wordToCompare, line);
        }

        if (wordToCompare === ';') {
          break;
        }
      } else {
        break;
      }

    }
  }

  async postArimeticOperator(wordToCompare: string, line: number) {
    wordToCompare = wordToCompare.match(this.arimeticOpRegEx)[0];

    if (wordToCompare.length === 1 && wordToCompare) {
      await this.generateToken('arimeticOperators', wordToCompare, line);
    } else {
      await this.generateToken('arimeticOperators', wordToCompare, line);
    }
  }

  async postChar(wordToCompare: string, line: number) {
    wordToCompare = wordToCompare.match(this.charRegEx)[0];
    wordToCompare = wordToCompare.replace(/'/g, '');

    if (wordToCompare.length === 1 && wordToCompare) {
      await this.generateToken('identifier', wordToCompare, line, true);
    } else {
      await this.generateToken('identifier', wordToCompare, line, false);
    }
  }

  async postNumber(wordToCompare: string, line: number) {
    if (Number(wordToCompare)) {
      await this.generateToken('identifier', wordToCompare, line, true);
    } else {
      await this.generateToken('identifier', wordToCompare, line, false);
    }
  }

  async postSemiColon(wordToCompare: string, line: number) {
    if (wordToCompare.match(/[;]/)) {
      await this.generateToken('miscellaneous', wordToCompare, line);
    } else {
      await this.generateToken('miscellaneous', wordToCompare, line);
    }
  }

  async postColon(wordToCompare: string, line: number) {
    if (wordToCompare.match(/[,]/)) {
      await this.generateToken('miscellaneous', wordToCompare, line);
    } else {
      await this.generateToken('miscellaneous', wordToCompare, line);
    }
  }

  async postIdentifier(wordToCompare: string, line: number) {

    if (wordToCompare.match(this.vairablesRegEx)) {
      await this.generateToken('identifier', wordToCompare, line, true);
    } else {
      await this.generateToken('identifier', wordToCompare, line);
    }
  }

  async postAssignation(codeToCompare: string, line: number) {
    if (codeToCompare.match(/^=/)) {
      await this.generateToken('assignationOperator', codeToCompare, line);
    } else {
      await this.generateToken('assignationOperator', codeToCompare, line);
    }
  }

  isDeclaration(code: string) {
    const option = /^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+ [\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+/;
    return (code.match(option)) ? true : false;
  }

  isAssignation(code: string) {
    const option = /^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬]+[ ]*=[ ]*[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]*/;
    return (code.match(option)) ? true : false;
  }

  verifyType(code: string): any {
    const type = code.match(/^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+/);

    return this.possibleTokens.dateTypes.options.indexOf(String(type[0]));
  }

  showTxtContent(contend: any) {
    const element = document.getElementById('userCode');
    element.innerHTML = contend;
  }

  keepCode(code: string) {
    this.code = code.split('\n');
    this.tokens = [];
    this.tokenErrors = [];
    this.tokensForTxt = [];

    for (let i = 0; i < this.code.length; i++) {
      if (this.code[i].length === 0) {
        this.code.splice(i, 1);
      }
    }

    this.analyzeCode();
  }

  async generateToken(code: string, lexeme: string, line: number, accept?: boolean) {
    const option = this.possibleTokens[`${code}`];
    const exist = await this.verifyTokenExistence(lexeme);

    let newToken = {};

    option.counter = option.counter + 1;

    if (accept === undefined) {
      accept = false;
    }
    console.log(accept);

    if (option.options.indexOf(lexeme) !== -1  || accept === true) {
      console.log('1');

      newToken = {
        line,
        lexeme,
        token: `${option.id}${option.counter}`
      };

      if (JSON.stringify(newToken) !== '{}'  && !exist) {
        console.log('2');

        this.tokens.push(newToken);
      }
      this.tokensForTxt.push(`${option.id}${option.counter}`);
    } else if (option.options.indexOf(lexeme) === -1 && !exist) {
      console.log('3');

      newToken = {
        line,
        lexeme,
        token: `ERL${option.id}${option.counter}`
      };
      await this.error(option.id, lexeme, line);

      if (JSON.stringify(newToken) !== '{}'  && !exist) {
        this.tokens.push(newToken);
      }
      this.tokensForTxt.push(`ERL${option.id}${option.counter}`);
    }
  }

  verifyTokenExistence(lexeme: string): boolean {
    let found = false;
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (token.lexeme === lexeme) {
        found = true;
        break;
      }
    }
    return found;
  }

  verifyErrorExistence(token: string): boolean {
    let found = false;

    for(let i = 0; i < this.tokenErrors.length; i++) {
      const error = this.tokenErrors[i];

      if(error.tokenError === token) {
        found = true;
        break;
      }
    }
    return found;
  }

  error(code: string, lexeme: string, line: number, message?: string) {
    const messageError = message || this.errors[`${code}`];

    const error = {
      tokenError: `ERL${code}${line}`,
      lexeme,
      line,
      messageError
    };
    console.log(error);

    this.tokenErrors.push(error);

  }
}
