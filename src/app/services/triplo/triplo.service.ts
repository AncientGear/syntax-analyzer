import { environment } from '../../../environments/environment.prod';

import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TriploService {

  constructor(private http: HttpClient) { }

  getPrefix(tokens: any): Observable<any> {

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'Application/json',
        'Access-Control-Allow-Origin': '*'
      });

      const body = {
        lexemes: tokens
      };

      return this.http.post(`${environment.urlAPI}/api/prefix`, body, {
        headers
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  getTriplo(prefix: any): Observable<any> {
<<<<<<< HEAD
    // console.log('get triplo');

=======
>>>>>>> 89145394da42aa24a6e1c58c081d8f12a9561193
    try {
      const headers = new HttpHeaders({
        'Content-Type': 'Application/json',
        'Access-Control-Allow-Origin': '*'
      });
<<<<<<< HEAD
      // console.log(prefix);
=======
>>>>>>> 89145394da42aa24a6e1c58c081d8f12a9561193

      const body = {
        prefix
      };
<<<<<<< HEAD
      console.log(body);
=======
>>>>>>> 89145394da42aa24a6e1c58c081d8f12a9561193

      return this.http.post(`${environment.urlAPI}/api/triplo`, body, {
        headers
      });
    } catch (err) {
      throw new Error(err);

    }
  }
}
