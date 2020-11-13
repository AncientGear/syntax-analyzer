import { environment } from '../../../environments/environment.prod'

import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TriploService {

  constructor(private http: HttpClient) { }

  getTriplo(tokens: any): Observable<any> {
    console.log(tokens);

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'Application/json',
        'Access-Control-Allow-Origin': '*'
      });

      const body = {
        lexemes: tokens
      };

      return this.http.post(`${environment.urlAPI}/api/triplo`, body, {
        headers
      });
    } catch (err) {
      throw new Error(err);
    }
  }
}
