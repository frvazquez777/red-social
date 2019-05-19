import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//modules requires
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//router
import { AppRoutingModule } from './app-routing.module';

//components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';

//security - services
import { UserService } from './services/user.service';
import { UserGuard } from './services/user.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    UserEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    UserService,
    UserGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
