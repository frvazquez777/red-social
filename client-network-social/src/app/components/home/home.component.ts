import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    public title: string;

    constructor() { 
        this.title = 'Welcome';
    }

    ngOnInit() { 
        console.log('Component Home Load');
    }

}