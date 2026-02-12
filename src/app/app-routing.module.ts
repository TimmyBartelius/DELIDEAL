import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home.component';


export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }
  
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}