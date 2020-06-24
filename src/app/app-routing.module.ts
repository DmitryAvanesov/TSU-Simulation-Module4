import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeatherComponent } from './weather/weather.component';
import { PointProcessComponent } from './point-process/point-process.component';
import { AgentBasedComponent } from './agent-based/agent-based.component';


const routes: Routes = [
  { path: 'weather', component: WeatherComponent },
  { path: 'point-process', component: PointProcessComponent },
  { path: 'agent-based', component: AgentBasedComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
