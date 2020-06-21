import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WeatherComponent } from './weather/weather.component';
import { PointProcessComponent } from './point-process/point-process.component';
import { AgentBasedComponent } from './agent-based/agent-based.component';

@NgModule({
  declarations: [
    AppComponent,
    WeatherComponent,
    PointProcessComponent,
    AgentBasedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
