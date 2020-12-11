import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-code',
  templateUrl: './input-code.component.html',
  styleUrls: ['./input-code.component.css']
})
export class InputCodeComponent implements OnInit {
  code = [];
  tokensForTxt = [];
  tokens = [];
  tokenErrors = [];

  @Output() sendCode: EventEmitter<any>;

  constructor() {
    this.sendCode = new EventEmitter();
  }

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

  keepCode(code: string) {
    this.code = code.split('\n');

    for (let i = 0; i < this.code.length; i++) {
      if (this.code[i].length === 0) {
        this.code.splice(i, 1);
        i--;
      }
    }
    this.optimizeCode();
    this.sendCode.emit(this.code);
  }

  optimizeCode() {
    try {
      for (let i = 0; i < this.code.length - 2; i++) {
        let line = this.code[i].split(" ");
        const aux1 = line[0];
        const aux2 = line[1];
        const aux3 = line[2];
        let found = false;

        if (aux1 && aux2 && aux3) {
          if (aux1.match(/^[\w]+/) && aux2.match(/^[\w$_["!#%&\/?'¡¿*΅~^`<>|°¬,;-]+/) && aux3 === '=') {
            for (let j = i + 1; j < this.code.length; j++) {
              let auxLine = this.code[j];
              if (auxLine.match(aux2)) {
                found = true;
                break;
              }
            }
            if (!found) {
              this.code.splice(i, 1);
              i--
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }

  }

  showTxtContent(contend: any) {
    const element = document.getElementById('userCode');
    element.innerHTML = contend;
  }
}
