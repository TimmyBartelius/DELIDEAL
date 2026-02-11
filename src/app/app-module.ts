import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app';
import { LoginComponent } from './pages/login/login';
import { AppRoutingModule } from './app-routing.module'; // exportera routes från app-routing.module.ts

import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './pages/register/register';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
