import { environment } from '../../../environments/environment.prod'

import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TriploService {

  constructor(private http: HttpClient) { }

  /**
   * @params {Number} tokens - array with the tokens
   // tslint:disable-next-line: jsdoc-format
   // tslint:disable-next-line: no-redundant-jsdoc
   * @return {Object} res - return the response of the API with all prefixes or launch an error
   */
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

  /**
   * @params {Number} prefix - array with the prefixes
   // tslint:disable-next-line: jsdoc-format
   // tslint:disable-next-line: no-redundant-jsdoc
   * @return {Object} res - return the response of the API with all triplos or launch an error
   */
  getTriplo(prefix: any): Observable<any> {
    console.log('get triplo');

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'Application/json',
        'Access-Control-Allow-Origin': '*'
      });
      console.log(prefix);

      const body = {
        prefix
      };
      console.log(body);

      return this.http.post(`${environment.urlAPI}/api/triplo`, body, {
        headers
      });
    } catch (err) {
      throw new Error(err);

    }
  }
}
