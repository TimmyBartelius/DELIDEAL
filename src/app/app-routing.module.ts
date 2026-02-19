import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/home/dashboard.component/dashboard.component';
import { LayoutComponent } from './shared/layout/layout';



export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},

  { path: '', component: LayoutComponent, children: [
    { path: 'home', component: HomeComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full'},
  ]},
  
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}