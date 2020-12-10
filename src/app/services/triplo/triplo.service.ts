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
    // console.log('get triplo');

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'Application/json',
        'Access-Control-Allow-Origin': '*'
      });
      // console.log(prefix);

      const body = {
        prefix
      };
      // console.log(body);

      return this.http.post(`${environment.urlAPI}/api/triplo`, body, {
        headers
      });
    } catch (err) {
      throw new Error(err);

    }
  }
}
