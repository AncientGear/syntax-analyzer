import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { APP_ROUTING } from './app-routing.module';

import { AppComponent } from './app.component';
import { RegexComponent } from './components/regex/regex.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    RegexComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    APP_ROUTING,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
