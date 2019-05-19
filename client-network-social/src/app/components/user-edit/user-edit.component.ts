import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from '../../models/user';

import { UserService } from '../../services/user.service';

@Component({
    selector: 'user-edit',
    templateUrl: 'user-edit.component.html',
    providers: [ UserService ]
})
export class UserEditComponent implements OnInit {
    
    public title: string;
    public user: User;
    public identity;
    public token;
    public status: string;
    public message: string;

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _userService: UserService
    ) { 
        this.title = 'Datos Personales';
        this.user = this._userService.getIdentity();
        this.identity = this.user;
        this.token = this._userService.getToken();
    }

    ngOnInit() { 
        console.log('Component UserEdit Load...');
    }

    obSubmit() {
        console.log(this.user);
        this._userService.updateUser(this.user).subscribe(
            response => {
                if(response.user && response.user._id) {
                    this.status = 'success';
                    localStorage.setItem('identity', JSON.stringify(this.user));
                    this.identity = this.user;
                } else {
                    this.status = 'error';
                    this.message = response.message
                }
            }, error => {
                console.log(error);
            }
        );
    }

}