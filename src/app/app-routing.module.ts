import { Routes, RouterModule } from '@angular/router';
import { RegexComponent } from './components/regex/regex.component';


const APP_ROUTES: Routes = [
  {path: 'analyzer', component: RegexComponent},
  {path: '**', pathMatch: 'full', redirectTo: 'analyzer' }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);
