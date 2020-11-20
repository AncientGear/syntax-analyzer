import { Component, OnInit } from '@angular/core';
import { SemanticErrorsService } from '../../services/semantic-errors.service';

@Component({
  selector: 'app-regex',
  templateUrl: './regex.component.html',
  styleUrls: ['./regex.component.css']
})
export class RegexComponent implements OnInit {
  code = [];
  tokensForTxt = [];
  tokensForSemantic = [];
  txt: string;
  tokens = [];
  tokensForTriplo = [];
  tokenErrors = [];
  context = 0;
  possibleTokens = {
    dataTypes: {
      id: 'TD',
      options: ['int', 'char', 'float'],
      counter: 0
    },
    iterator: {
      id: 'IT',
      options: ['while'],
      counter: 0
    },
    arimeticOperators: {
      id: 'OA',
      options: ['+', '-', '/', '*'],
      counter: 0
    },
    relationalOperators: {
      id: 'OR',
      options: ['<', '<=', '>', '>=', '!=', '==', '&&', '||', '!='],
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
  vairablesRegEx = /^[a-zA-Z][\w0-9$]*|[0-9]*/;
  numbersRegEx = /[\d]*[.]*[\d]*/;
  arimeticOpRegEx = /^[+-\/*]/;
  constructor(private semanticErrorService: SemanticErrorsService) { }

  ngOnInit(): void { }

  async keepCode(code: any) {

    this.code = code;
    this.tokens = [];
    this.tokenErrors = [];
    this.tokensForTxt = [];
    this.tokensForSemantic = [];
    this.tokensForTriplo = [];

    await this.analyzeCode();
  }

  async analyzeCode() {
    this.inizializeCounters();
    // tslint:disable-next-line: prefer-for-of
    let line = 1;

    for (let i = 0; i < this.code.length; i++) {

      const code = this.code.shift();

      line = await this.verifyLineCodeType(code, line) || line;

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

    const semanticErrors = await this.semanticErrorService.analizaTable(this.tokensForSemantic);

    this.tokenErrors = this.tokenErrors.concat(semanticErrors);

    this.txt = this.tokensForTxt.join(' ');
  }

  async verifyLineCodeType(code: string, line: number, context?: number) {
    context = context || 1;

    if (this.isDeclaration(code)) {
      await this.declaration(code, line, context);
    } else if (this.isAssignation(code)) {
      await this.assignation(code, line, context);
    } else if (this.isWhile(code)) {
      line = await this.While(code, line, context);
    }

    this.tokensForTriplo.push('\n');
    return line;
  }

  inizializeCounters() {
    const tokens = this.possibleTokens;

    tokens.arimeticOperators.counter = 0;
    tokens.assignationOperator.counter = 0;
    tokens.conditionalOperators.counter = 0;
    tokens.dataTypes.counter = 0;
    tokens.delimiters.counter = 0;
    tokens.miscellaneous.counter = 0;
    tokens.relationalOperators.counter = 0;
    tokens.notFound.counter = 0;
    tokens.identifier.counter = 0;
    tokens.iterator.counter = 0;

    this.context = 0;
  }

  async declaration(code: string, line: number, context: number) {
    let wordToCompare = '';

    let type = await this.verifyType(code);
    type = this.possibleTokens.dataTypes.options[type] || code.split(' ')[0];

    await this.generateToken('dataTypes', type, line, context);
    let codeToCompare = code.split(type)[1].replace(/ /g, '');
    //
    wordToCompare = codeToCompare.match(/[\w]+/)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');
    await this.postIdentifier(wordToCompare, line, context, type);

    while (codeToCompare.match(/[\w$_["!#%&\/?='¡¿*΅~^`<>|°¬,-]+/)) {


      if (codeToCompare.length === 0) {
        await this.postSemiColon('', line, context);
        break;
      }

      wordToCompare = codeToCompare.match(/./)[0];
      codeToCompare = codeToCompare.replace(/./, '');

      if (codeToCompare.length === 0) {
        await this.postSemiColon('', line, context);
        break;
      }

      await this.postAssignation(wordToCompare, line, context);

      wordToCompare = codeToCompare.match(/[a-zA-Z0-9$_()\.{}["!#%&\/?'¡¿*΅~^`<>|°¬-]+/)[0];
      const possibleColon = wordToCompare.split('')[0];

      if (possibleColon === '\'') {
        codeToCompare = codeToCompare.replace(possibleColon, '');
        await this.postMiscellaneous(possibleColon, line, context);

        wordToCompare = codeToCompare.match(/[a-zA-Z0-9$_()\.{}[!#%&\/?¡¿*΅~^<>|°¬-]+/)[0];
        codeToCompare = codeToCompare.replace(wordToCompare, '');
        await this.postChar(wordToCompare, line, context);
        wordToCompare = codeToCompare.match(/^./)[0];
        codeToCompare = codeToCompare.replace(wordToCompare, '');
        // await this.postMiscellaneous()
      } else if (Number(wordToCompare)) {
        await this.postNumber(wordToCompare, line, context);
        codeToCompare = codeToCompare.replace(wordToCompare, '');
      } else {
        await this.postIdentifier(wordToCompare, line, context);
        codeToCompare = codeToCompare.replace(wordToCompare, '');
      }
      if (codeToCompare.length === 0) {
        await this.postSemiColon('', line, context);
        break;
      }

      wordToCompare = codeToCompare.match(/./)[0];

      if (wordToCompare !== ';') {
        codeToCompare = codeToCompare.replace(/./, '');
        await this.postColon(wordToCompare, line, context);
      } else {
        this.postSemiColon(wordToCompare, line, context);
        codeToCompare = codeToCompare.replace(/./, '');
        break;
      }
    }

    if (codeToCompare.length === 1) {
      wordToCompare = codeToCompare.match(/./)[0];

      await this.postSemiColon(wordToCompare, line, context);
    }
  }

  async assignation(code: string, line: number, context: number) {

    let codeToCompare = code.replace(/[ ]/g, '');
    let wordToCompare = codeToCompare.match(/^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬-]+/)[0];

    await this.postIdentifier(wordToCompare, line, context);

    codeToCompare = codeToCompare.replace(wordToCompare, '');

    wordToCompare = codeToCompare.match(/^[\a-zA-Z$_(){}["!#%&?'¡¿*΅~^`<>|°¬-]*=/)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');


    await this.postAssignation(wordToCompare, line, context);

    while (codeToCompare.match(/^[\w$_(){}["!#%&\/?='¡¿*΅~^`<>|°¬,;-]+/)) {

      wordToCompare = codeToCompare.match(/^[\w$_(){}["\.!#%&?'¡¿΅~^`<>|°¬]+/)[0];

      if (Number(wordToCompare)) {

        await this.postNumber(wordToCompare, line, context);
      } else {
        await this.postIdentifier(wordToCompare, line, context);
      }

      codeToCompare = codeToCompare.replace(wordToCompare, '');
      if (codeToCompare.length === 0) {
        await this.postSemiColon('', line, context);
        break;
      }
      if (codeToCompare.length === 1) {
        wordToCompare = codeToCompare.match(/./)[0];

        await this.postSemiColon(wordToCompare, line, context);
        break;
      }
      codeToCompare = codeToCompare.replace(/^[ ]/, '');
      if (codeToCompare.length > 0) {

        wordToCompare = codeToCompare.match(/[+-/*]+/)[0];
        codeToCompare = codeToCompare.replace(wordToCompare, '');

        if (wordToCompare) {
          await this.postArimeticOperator(wordToCompare, line, context);
        } else {
          await this.postSemiColon(wordToCompare, line, context);
        }

        if (wordToCompare === ';') {
          break;
        }
      } else {
        break;
      }

    }
  }

  async While(code: string, line: number, context: number) {
    context++;

    let codeToCompare = code;
    let wordToCompare = codeToCompare.match(/^[a-zA-ZáéíóúÁÉÍÓÚ\w]*/)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');
    await this.postWhile(wordToCompare, line, context);

    wordToCompare = codeToCompare.match(/^./)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');
    await this.postDelimiter(wordToCompare, line, context);


    let conditions = codeToCompare.match(/^[\w$_"!#%&\/?='¡¿*΅~^`<>|°¬,]*/)[0];
    codeToCompare = codeToCompare.replace(conditions, '');


    if (conditions.length !== 0) {

      while (conditions.length > 0) {

        const condition = conditions.match(/^[\w\d\.*$_"#%\/?'¡¿*΅~^`°¬,]+/)[0];
        conditions = conditions.replace(condition, '');

        await this.postIdentifier(condition, line, context);

        if (conditions.length === 0) { break; }

        const conditional = conditions.match(/^[&=<>|][&=<>|]|\<|\>|\!=/)[0];
        conditions = conditions.replace(conditional, '');

        await this.postRelationalOperators(conditional, line, context);
      }
    }

    wordToCompare = codeToCompare.match(/^./)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');
    await this.postDelimiter(wordToCompare, line, context);

    wordToCompare = codeToCompare.match(/^./)[0];
    codeToCompare = codeToCompare.replace(wordToCompare, '');
    await this.postDelimiter(wordToCompare, line, context);

    this.tokensForTxt.push('\n');
    this.tokensForTriplo.push('\n');

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.code.length; i++) {
      const str = this.code.shift();
      line++;
      if (!str.match(/}.*/)) {
        i--;
        codeToCompare = str.replace(/^[ ]*/, '');
        await this.verifyLineCodeType(codeToCompare, line, context);
      } else {
        wordToCompare = str;

        await this.postDelimiter(wordToCompare, line, context);
        break;
      }
    }

    return line;
  }

  async postRelationalOperators(wordToCompare: string, line: number, context: number) {
    await this.generateToken('relationalOperators', wordToCompare, line, context);
  }

  async postDelimiter(wordToCompare: string, line: number, context: number) {
    if (wordToCompare.match(/(|)|{|}|[|]/)) {
      await this.generateToken('delimiters', wordToCompare, line, context);
    } else {
      await this.generateToken('delimiters', wordToCompare, line, context);
    }
  }

  async postMiscellaneous(wordToCompare: string, line: number, context: number) {
    if (wordToCompare.match(/'/)) {
      await this.generateToken('miscellaneous', wordToCompare, line, context);
    } else {
      await this.generateToken('miscellaneous', wordToCompare, line, context);
    }
  }

  async postArimeticOperator(wordToCompare: string, line: number, context: number) {
    const codeToCompare = wordToCompare.match(this.arimeticOpRegEx)[0];

    if (wordToCompare.length === 1 && codeToCompare) {
      await this.generateToken('arimeticOperators', codeToCompare, line, context);
    } else {
      await this.generateToken('arimeticOperators', wordToCompare, line, context);
    }
  }

  async postChar(wordToCompare: string, line: number, context: number) {
    wordToCompare = wordToCompare.match(this.charRegEx)[0];
    wordToCompare = wordToCompare.replace(/'/g, '');

    if (wordToCompare.length === 1 && wordToCompare) {
      await this.generateToken('identifier', wordToCompare, line, context, true, 'char');
    } else {
      await this.generateToken('identifier', wordToCompare, line, context, false);
    }
  }

  async postNumber(wordToCompare: string, line: number, context: number) {
    if (Number(wordToCompare)) {
      await this.generateToken('identifier', wordToCompare, line, context, true, 'number');
    } else {
      await this.generateToken('identifier', wordToCompare, line, context, false);
    }
  }

  async postWhile(wordToCompare: string, line: number, context: number) {
    if (wordToCompare === 'while') {
      await this.generateToken('iterator', wordToCompare, line, context, true);
    } else {
      await this.generateToken('iterator', wordToCompare, line, context, false);
    }
  }

  async postSemiColon(wordToCompare: string, line: number, context: number) {

    if (wordToCompare === ';') {

      await this.generateToken('miscellaneous', wordToCompare, context, line);
    } else {
      await this.generateToken('miscellaneous', 'null', line, context);
    }
  }

  async postColon(wordToCompare: string, line: number, context: number) {
    if (wordToCompare.match(/[,]/)) {
      await this.generateToken('miscellaneous', wordToCompare, line, context);
    } else {
      await this.generateToken('miscellaneous', wordToCompare, line, context);
    }
  }

  async postIdentifier(wordToCompare: string, line: number, context: number, type?: string) {

    if (Number(wordToCompare) || type === 'int' || type === 'float') {
      type = 'number';
    }

    if (wordToCompare.match(this.vairablesRegEx)) {
      await this.generateToken('identifier', wordToCompare, line, context, true, type);
    } else {
      await this.generateToken('identifier', wordToCompare, line, context);
    }
  }

  async postAssignation(codeToCompare: string, line: number, context: number) {
    if (codeToCompare.match(/^=/)) {
      await this.generateToken('assignationOperator', codeToCompare, line, context);
    } else {
      await this.generateToken('assignationOperator', codeToCompare, line, context);
    }
  }

  isDeclaration(code: string) {
    const option = /^[\w$_["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+ [\w$_["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+/;
    return (code.match(option)) ? true : false;
  }

  isAssignation(code: string) {
    const option = /^[\w$_["!#%&\/?'¡¿*΅~^`<>|°¬]+[ ]*=[ ]*[\w$_["!#%&\/?'¡¿*΅~^`<>|°¬,;-]*/;
    return (code.match(option)) ? true : false;
  }


  isWhile(code: string) {

    const option = /\w+\(*[\w_\/#$"!|°¬\'?¿¡.,0-9:><=& |]*\)*{*/;

    return (code.match(option)) ? true : false;
  }

  verifyType(code: string): any {
    const type = code.match(/^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+/);

    return this.possibleTokens.dataTypes.options.indexOf(String(type[0]));
  }

  async generateToken(code: string, lexeme: string, line: number, context: number, accept?: boolean, dataType?: string) {
    const option = this.possibleTokens[`${code}`];

    let newToken;
    if (accept === undefined) {
      accept = false;
    }

    const { found, index } = await this.verifyTokenExistence(lexeme);

    if (found !== false) {
      this.tokensForTxt.push(this.tokens[index].token);
      this.tokensForSemantic.push(this.tokens[index]);
      if (option.id === 'ID' || option.id === 'AS' || option.id === 'OR' || option.id === 'OA' || option.id === 'IT') {
        const token = { ...this.tokens[index] };
        token.context = context;

        this.tokensForTriplo.push(token);
      }
    } else {
      option.counter++;
      if (option.options.indexOf(lexeme) !== -1 || accept === true) {

        newToken = {
          line,
          lexeme,
          token: `${option.id}${option.counter}`,
          id: option.id,
          context,
          dataType: dataType || 'undefined'
        };

        this.tokensForTxt.push(`${option.id}${option.counter}`);
        this.tokensForSemantic.push(newToken);

        if (option.id === 'ID' || option.id === 'AS' || option.id === 'OR' || option.id === 'OA' || option.id === 'IT') {
          this.tokensForTriplo.push(newToken);
        }

      } else {
        newToken = {
          line,
          lexeme,
          token: `ERR${option.id}${option.counter}`,
          id: option.id,
          context,
          dataType: dataType || 'undefined'
        };

        newToken.message = this.errors[`${option.id}`];
        this.tokenErrors.push(newToken);
        this.tokensForTxt.push(`ERR${option.id}${option.counter}`);
        this.tokensForSemantic.push(newToken);

        if (option.id === 'ID' || option.id === 'AS' || option.id === 'OR' || option.id === 'OA' || option.id === 'IT') {
          this.tokensForTriplo.push(newToken);
        }
      }
      if (JSON.stringify(newToken) !== '{}') {
        this.tokens.push(newToken);
      }

    }
  }

  verifyTokenExistence(lexeme: string) {
    let index;
    let found = false;
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (token.lexeme === lexeme) {
        index = i;
        found = true;
      }
    }
    return { found, index };
  }

  verifyErrorExistence(token: string): boolean {
    let found = false;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.tokenErrors.length; i++) {
      const error = this.tokenErrors[i];

      if (error.tokenError === token) {
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
