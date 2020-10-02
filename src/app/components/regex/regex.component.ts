import { Component, OnInit } from '@angular/core'

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
      options: [',', ';', ':', '\''],
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
  charRegEx = /./;
  vairablesRegEx = /^[a-zA-Z][\w$]*/;
  numbersRegEx = /[\d]*[.]*[\d]*/;
  arimeticOpRegEx = /^[+-\/*]/;
  constructor() { }

  ngOnInit(): void { }

  async keepCode(code: any) {
    this.code = code;
    this.tokens = [];
    this.tokenErrors = [];
    this.tokensForTxt = [];

    await this.analyzeCode();
  }

  async analyzeCode() {
    this.inizializeCounters();
    // tslint:disable-next-line: prefer-for-of
    let line = 1;
    for (let i = 0; i < this.code.length; i++) {

      const code = this.code.shift();

      await this.verifyLineCodeType(code, line);

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

    this.txt = this.tokensForTxt.join(' ');


  }

  async verifyLineCodeType(code: string, line: number) {
    if (this.isDeclaration(code)) {
      await this.declaration(code, line);
    } else if (this.isAssignation(code)) {
      await this.assignation(code, line);
    }
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
      wordToCompare = codeToCompare.match(/[\w]+/)[0];
      codeToCompare = codeToCompare.replace(wordToCompare, '');

      if (codeToCompare.length === 0) {
        await this.postSemiColon('', line);
        break;
      }
      await this.postIdentifier(wordToCompare, line);


      wordToCompare = codeToCompare.match(/./)[0];
      codeToCompare = codeToCompare.replace(/./, '');

      if (codeToCompare.length === 0 ) {
        await this.postSemiColon('', line);
        break;
      }

      await this.postAssignation(wordToCompare, line);

      wordToCompare = codeToCompare.match(/[a-zA-Z0-9$_()\.{}["!#%&\/?'¡¿*΅~^`<>|°¬-]+/)[0];
      const possibleColon = wordToCompare.split('')[0];

      if(possibleColon === '\'') {
        codeToCompare = codeToCompare.replace(possibleColon, '');
        await this.postMiscellaneous(possibleColon, line);

        wordToCompare = codeToCompare.match(/[a-zA-Z0-9$_()\.{}[!#%&\/?¡¿*΅~^<>|°¬-]+/)[0];
        codeToCompare = codeToCompare.replace(wordToCompare, '');
        await this.postChar(wordToCompare, line);
        wordToCompare = codeToCompare.match(/^./)[0];
        codeToCompare = codeToCompare.replace(wordToCompare, '');
        // await this.postMiscellaneous()
      } else if (Number(wordToCompare)) {
        await this.postNumber(wordToCompare, line);
        codeToCompare = codeToCompare.replace(wordToCompare, '');
      } else {
        await this.postIdentifier(wordToCompare, line);
        codeToCompare = codeToCompare.replace(wordToCompare, '');
      }
      if(codeToCompare.length === 0 ){
        await this.postSemiColon('', line);
        break;
      }

      wordToCompare = codeToCompare.match(/./)[0];

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
    let wordToCompare = codeToCompare.match(/^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬-]+/)[0];

    await this.postIdentifier(wordToCompare, line);

    codeToCompare = codeToCompare.replace(wordToCompare, '');

    wordToCompare = codeToCompare.match(/^[\a-zA-Z$_(){}["!#%&?'¡¿*΅~^`<>|°¬-]*=/)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');


    await this.postAssignation(wordToCompare, line);

    while (codeToCompare.match(/^[\w$_(){}["!#%&\/?='¡¿*΅~^`<>|°¬,;-]+/)) {

      wordToCompare = codeToCompare.match(/^[\w$_(){}["\.!#%&?'¡¿΅~^`<>|°¬]+/)[0];

      if (Number(wordToCompare)) {

        await this.postNumber(wordToCompare, line);
      } else{
        await this.postIdentifier(wordToCompare, line);
      }

      codeToCompare = codeToCompare.replace(wordToCompare, '');
      if (codeToCompare.length === 0 ) {
        await this.postSemiColon('', line);
        break;
      }
      if (codeToCompare.length === 1) {
        wordToCompare = codeToCompare.match(/./)[0];

        await this.postSemiColon(wordToCompare, line);
        break;
      }
      codeToCompare = codeToCompare.replace(/^[ ]/, '');
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

  async postMiscellaneous(wordToCompare: string, line: number) {
    if (wordToCompare.match(/'/)) {
      await this.generateToken('miscellaneous', wordToCompare, line);
    } else {
      await this.generateToken('miscellaneous', wordToCompare, line);
    }
  }

  async postArimeticOperator(wordToCompare: string, line: number) {
    const codeToCompare = wordToCompare.match(this.arimeticOpRegEx)[0];

    if (wordToCompare.length === 1 && codeToCompare) {
      await this.generateToken('arimeticOperators', codeToCompare, line);
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
      await this.generateToken('miscellaneous', 'null', line);
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
    const option =  /^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬]+[ ]*=[ ]*[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]*/;
    return (code.match(option)) ? true : false;
  }

  isWhile(code: string) {
    const option = /^[\w$_{}["!#%&\/?'¡¿*΅~^`<>|°¬]+[ ]*([\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬;]){/;

    return (code.match(option)) ? true : false;
  }

  verifyType(code: string): any {
    const type = code.match(/^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+/);

    return this.possibleTokens.dateTypes.options.indexOf(String(type[0]));
  }

  async generateToken(code: string, lexeme: string, line: number, accept?: boolean) {
    const option = this.possibleTokens[`${code}`];

    let newToken;
    if (accept === undefined) {
        accept = false;
    }

    const exist = await this.verifyTokenExistence(lexeme);

    if (exist !== false) {
        this.tokensForTxt.push(this.tokens[exist].token);
    } else {
        option.counter++;
        if (option.options.indexOf(lexeme) !== -1 || accept === true) {

          newToken = {
              line,
              lexeme,
              token: `${option.id}${option.counter}`
          };

          this.tokensForTxt.push(`${option.id}${option.counter}`);

        } else {
            newToken = {
                line,
                lexeme,
                token: `ERR${option.id}${option.counter}`,
            };

            newToken.message = this.errors[`${option.id}`];
            this.tokenErrors.push(newToken);
            this.tokensForTxt.push(`ERR${option.id}${option.counter}`);
            console.log(newToken);
        }
        if (JSON.stringify(newToken) !== '{}') {
            this.tokens.push(newToken);
        }
      }
  }

  verifyTokenExistence(lexeme: string) {

    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (token.lexeme === lexeme) {
        return i;
      }
    }
    return false;
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

    this.tokenErrors.push(error);

  }
}
