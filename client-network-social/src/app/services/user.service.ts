import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
//models
import { User } from '../models/user';
import { getToken } from '@angular/router/src/utils/preactivation';

@Injectable()
export class UserService {

    public url: string;
    public identity;
    public token;
    public stats;

    constructor(
        private _http: HttpClient
    ) {
        this.url = GLOBAL.url;
    }

    register(user: User): Observable<any> {

        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-type', 'application/json');
        let ws = this.url + 'register';

        return this._http.put(ws + user._id, params, {headers: headers});
    }

    updateUser(user: User): Observable<any> {
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-type', 'application/json')
            .set('Authorization', this.getToken());

        let ws = this.url + 'update-user/';

        return this._http.put(ws + user._id, params, {headers: headers});
    }

    signup(user: User, gettoken = null): Observable<any> {
        if(gettoken != null) {
            user.gettoken = gettoken;
        }
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-type', 'application/json');
        let ws = this.url + 'login';

        return this._http.post(ws, params, {headers: headers});
    }

    getIdentity() {
        let identity = JSON.parse(localStorage.getItem('identity'));

        if(identity != 'undefined') {
            this.identity = identity;
        } else {
            this.identity = null;
        }
        return this.identity;
    }    
    
    getToken() {
        let token = localStorage.getItem('token');

        if(token != 'undefined') {
            this.token = token;
        } else {
            this.token = null;
        }
        return this.token;
    }

    getStats(){
        let stats = JSON.parse(localStorage.getItem('stats'));
        if(stats != 'undefined') {
            this.stats = stats;
        } else {
            this.stats = null;
        }
        return this.stats;
    }

    getCounters(userId = null): Observable<any> {
        let headers = new HttpHeaders().set('Content-type', 'application/json')
                                        .set('Authorization', this.getToken());
        let ws = this.url + 'counters';
        if(userId != null) {
            return this._http.get(ws + '/' + userId, {headers: headers});
        } else {
            return this._http.get(ws, {headers: headers});
        }
    }
 
}