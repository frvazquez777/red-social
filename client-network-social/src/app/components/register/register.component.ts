
import  { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

//models
import { User } from '../../models/user';

//services
import { UserService } from '../../services/user.service';

@Component({
    selector: 'login',
    templateUrl: './register.component.html',
    providers: [ UserService ]
})
export class RegisterComponent implements OnInit {
    public title: string;
    public user: User;
    public status: string;
    public message: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService : UserService
    ) { 
        this.title = 'Registro';
        this.user = new User('', '', '', '', '', '', 'ROLE_USER', '');
    }

    ngOnInit() { 
        console.log('Component Register load');
    }

    onSubmit(registerForm){
        console.log('register');
        this._userService.register(this.user).subscribe(
            response => {

                if(response.user && response.user._id) {
                    this.status = 'success';
                    registerForm.reset();
                } else {
                    this.status = 'error';
                    this.message = response.message;
                }
            }, error => {
                console.log(error);
            }
        );
    }
}