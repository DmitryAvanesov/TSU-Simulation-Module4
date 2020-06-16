import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {

  time: number;
  state: number;

  constructor(private weather: WeatherService) {
  }

  ngOnInit(): void {
    this.state = this.weather.getInitialState();
    this.setChangeStateTimeout();
    
    this.weather.stateChanged.subscribe(newState => {
      this.state = newState;
      this.setChangeStateTimeout();
    });
  }

  setChangeStateTimeout(): void {
    setTimeout(
      () => {
        this.weather.changeState(this.state)
      },
      this.weather.getTimeInterval(this.state)
    );
  }

}
