import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './pages/register/register';


export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}