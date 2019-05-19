import  { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

//models
import { User } from '../../models/user';

//services
import { UserService } from '../../services/user.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    providers: [ UserService ]
})
export class LoginComponent implements OnInit {
    public title: string;
    public user: User;
    public status: string;
    public message: string;
    public token;
    public identity;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ) { 
        this.title = 'Identificate';
        this.user = new User('', '', '', '', '', '', '', '');
    }

    ngOnInit() { 
        console.log('Component Login load');
    }

    onSubmit() {
        this._userService.signup(this.user).subscribe(
            response => {
                if(response.user && response.user._id) {
                    this.identity = response.user;
                    // console.log(this.identity);

                    if(!this.identity || !this.identity._id) {
                        this.status = 'error';
                        this.message = response.message;
                    } else {
                        //persistencia
                        localStorage.setItem('identity', JSON.stringify(this.identity));
                        //gettoken
                        this.getToken();
                    }
                } else {
                    this.status = 'error';
                    this.message = response.message;
                }
            }, error => {
                this.status = 'error'
                this.message = error.error.message;
            }
        );
    }


    getToken() {
        this._userService.signup(this.user, 'true').subscribe(
            response => {
                this.token = response.token;
                // console.log(this.token);
                if(this.token.lenght <= 0) {
                    this.status = 'error';
                    this.message = response.message;
                } else {
                    //persistir datos localstorage
                    localStorage.setItem('token', this.token);
                    //conseguir las estadistica del usuario
                    this.getCounters();
                }
            }, error => {
                this.status = 'error'
                this.message = error.error.message;
            }
        );
    }

    getCounters() {
        this._userService.getCounters().subscribe(
            response => {
                localStorage.setItem('stast', JSON.stringify(response));
                this.status = 'success';
                this._router.navigate(['/']);
                
            }, error => {
                console.log(error);
            }
        );
    }
}