import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegexComponent } from './regex.component';
import { ExampleCodeComponent } from '../example-code/example-code.component';
import { InputCodeComponent } from '../input-code/input-code.component';
import { TokensTableComponent } from '../tokens-table/tokens-table.component';
import { ErrorsTableComponent } from '../errors-table/errors-table.component';



@NgModule({
  declarations: [RegexComponent,
    ExampleCodeComponent,
    InputCodeComponent,
    TokensTableComponent,
    ErrorsTableComponent
  ],
  imports: [
    CommonModule
  ]
})
export class RegexModule { }
