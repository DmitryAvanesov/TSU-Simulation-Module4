import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {

  state: number;
  daysPassed: number;
  hoursOfDayPassed: number;

  constructor(private weather: WeatherService) {
  }

  ngOnInit(): void {
    this.state = this.weather.getInitialState();
    this.setChangeStateTimeout();

    this.weather.stateChanged.subscribe(newState => {
      this.state = newState;
      this.setChangeStateTimeout();
    });

    this.daysPassed = 1;
    this.hoursOfDayPassed = 0;

    setInterval(
      () => {
        console.log(this.hoursOfDayPassed)
        this.hoursOfDayPassed++;

        if (this.hoursOfDayPassed == 24) {
          this.daysPassed++;
          this.hoursOfDayPassed = 0;
        }
      },
      this.weather.hourDuration
    );
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
