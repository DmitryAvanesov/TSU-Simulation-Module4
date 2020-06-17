import { Component, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { lusolve } from 'mathjs';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {

  state: number;
  distribution: Array<Array<number>>;
  daysPassed: number;
  hoursOfDayPassed: number;
  coefficients: Array<Array<number>>;
  hourDuration: number;
  timeStamp: number;
  testTime: Array<number>;
  totalTime: number;
  testDistribution: Array<number>;
  averageError: number;
  varianceError: number;
  stateNames: Array<string>;

  stateChangedSource: Subject<number>;
  stateChanged: Observable<number>;

  ngOnInit(): void {
    this.coefficients = new Array(new Array(-0.4, 0.3, 0.1), new Array(0.4, -0.8, 0.4), new Array(0.1, 0.4, -0.5));
    this.state = this.getInitialState();
    this.hourDuration = 250;
    this.timeStamp = Date.now();
    this.testTime = new Array(this.coefficients.length).fill(0);
    this.totalTime = 0;
    this.testDistribution = new Array(this.coefficients.length);
    this.stateNames = new Array('Sunny', 'Partly cloudy', 'Cloudy');

    this.stateChangedSource = new Subject<number>();
    this.stateChanged = this.stateChangedSource.asObservable();

    this.setChangeStateTimeout();

    this.stateChanged.subscribe(newState => {
      const timePassed = Date.now() - this.timeStamp;
      this.totalTime += timePassed;
      this.testTime[this.state] += timePassed;  
      this.timeStamp = Date.now();

      for (const [index, value] of this.testTime.entries()) {
        this.testDistribution[index] = value / this.totalTime;
      }

      let averageReal = 0;

      for (const [index, value] of this.distribution.entries()) {
        averageReal += index * value[0];
      }

      let varianceReal = 0;

      for (const [index, value] of this.distribution.entries()) {
        varianceReal += Math.pow(index * averageReal, 2);
      }

      varianceReal /= this.distribution.length - 1;

      let averageTest = 0;

      for (const [index, value] of this.testDistribution.entries()) {
        averageTest += index * value;
      }

      let varianceTest = 0;

      for (const [index, value] of this.testDistribution.entries()) {
        varianceTest += Math.pow(index * averageTest, 2);
      }

      varianceTest /= this.distribution.length - 1;

      this.averageError = Math.abs(averageTest - averageReal) / Math.abs(averageReal);
      this.varianceError = Math.abs(varianceTest - varianceReal) / Math.abs(varianceReal);
      this.state = newState;

      this.setChangeStateTimeout();
    });

    this.daysPassed = 1;
    this.hoursOfDayPassed = 0;

    setInterval(
      () => {
        this.hoursOfDayPassed++;

        if (this.hoursOfDayPassed == 24) {
          this.daysPassed++;
          this.hoursOfDayPassed = 0;
        }
      },
      this.hourDuration
    );
  }

  setChangeStateTimeout(): void {
    setTimeout(
      () => {
        this.changeState()
      },
      this.getTimeInterval()
    );
  }

  getInitialState(): number {
    const parameters = new Array();
    const terms = new Array();

    for (let i = 0; i < this.coefficients.length - 1; i++) {
      const curParameters = new Array();

      for (const row of this.coefficients) {
        curParameters.push(row[i]);
      }

      parameters.push(curParameters);
      terms.push(0);
    }

    parameters.push(new Array(this.coefficients.length).fill(1));
    terms.push(1);

    this.distribution = lusolve(parameters, terms) as Array<Array<number>>;

    const alpha = Math.random();
    let curProbability = 0;

    for (const [index, value] of (this.distribution as Array<Array<number>>).entries()) {
      curProbability += value[0];

      if (alpha < curProbability) {
        return index;
      }
    }

    return 0;
  }

  getTimeInterval(): number {
    return Math.log(Math.random()) / this.coefficients[this.state][this.state] * this.hourDuration;
  }

  changeState(): void {
    const distribution = new Array();

    for (const [index] of this.coefficients.entries()) {
      distribution.push(index == this.state ? 0 : -this.coefficients[this.state][index] / this.coefficients[this.state][this.state]);
    }

    const alpha = Math.random();
    let curProbability = 0;

    for (const [index, value] of distribution.entries()) {
      curProbability += value;

      if (alpha < curProbability) {
        this.stateChangedSource.next(index);
        break;
      }
    }
  }

}
