import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-regex',
  templateUrl: './regex.component.html',
  styleUrls: ['./regex.component.css']
})
export class RegexComponent implements OnInit {
  code: any[];
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
    identifiers: {
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
  vairablesRegEx = /[a-zA-Z][\w$]*/;
  constructor() { }

  ngOnInit(): void {
  }

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
    while (this.code.length > 0) {
      const code = this.code.shift();
      if (code === undefined) {
        break;
      }

      if (this.isDeclaration(code)) {
        await this.declaration(code, line);
      } else if (this.isAssignation(code)) {
        await this.assignation();
      }
      line++;
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
    tokens.identifiers.counter = 0;
  }

  async declaration(code: string, line: number) {

    let type = await this.verifyType(code);
    type = this.possibleTokens.dateTypes.options[type] || code.split(' ')[0];

    await this.generateToken('dateTypes', type, line);
    let codeToCompare = code.split(type)[1].replace(/ /g, '');

    while (codeToCompare.match(/[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+/)) {
      let wordToCompare = codeToCompare.match(/[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+/)[0];
      codeToCompare = codeToCompare.replace(wordToCompare, '');

      await this.postIdentifier(wordToCompare, line);

      wordToCompare = codeToCompare.split('')[0];
      // codeToCompare = codeToCompare.replace('.', '');

      await this.postAssignation(wordToCompare, line);
      console.log('tokens' + this.tokens);
      console.log('Code' + codeToCompare);
      console.log('Word' + wordToCompare);


      console.log(codeToCompare.match(/[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬-]+/)[0]);

      await this.postAssignation(wordToCompare, line);
      console.log('1');

    }
    console.log('End while');

  }

  async postIdentifier(wordToCompare: string, line: number) {
    if (wordToCompare.match(this.vairablesRegEx)) {
      await this.generateToken('identifiers', wordToCompare, line, true);
    } else {
      await this.generateToken('identifiers', wordToCompare, line);
    }
  }

  async postAssignation(codeToCompare: string, line: number) {
    if (codeToCompare.match(/^=/)) {
      await this.generateToken('assignationOperator', codeToCompare, line);
    } else {
      await this.generateToken('assignationOperator', codeToCompare, line);
    }
  }

  assignation() {

  }

  isDeclaration(code: string) {
    const option = /^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+ [\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+ *= *[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬ ,;]*/;
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

    if (!accept) {
      accept = false;
    }

    if (option.options.indexOf(lexeme) !== -1 && !exist || accept) {
      newToken = {
        line,
        lexeme,
        token: `${option.id}${option.counter}`
      };


    } else if ((option.options.indexOf(lexeme) === -1 && !exist)) {

      newToken = {
        line,
        lexeme,
        token: `ERL${option.id}${option.counter}`
      };

      await this.error(option.id, lexeme, line);
    }

    this.tokens.push(newToken);
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

    this.tokenErrors.push(error);

  }
}
