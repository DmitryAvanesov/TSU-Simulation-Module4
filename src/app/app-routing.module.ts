import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeatherComponent } from './weather/weather.component';
import { PointProcessComponent } from './point-process/point-process.component';


const routes: Routes = [
  { path: 'weather', component: WeatherComponent },
  { path: 'point-process', component: PointProcessComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
