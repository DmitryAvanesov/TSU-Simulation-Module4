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
  daysPassed: number;
  hoursOfDayPassed: number;
  coefficients: Array<Array<number>>;
  hourDuration: number;
  testState: number;
  testData: Array<number>;

  stateChangedSource: Subject<number>;
  stateChanged: Observable<number>;
  stateChangedTestSource: Subject<number>;
  stateChangedTest: Observable<number>;

  ngOnInit(): void {
    this.coefficients = new Array(new Array(-0.4, 0.3, 0.1), new Array(0.4, -0.8, 0.4), new Array(0.1, 0.4, -0.5));

    // real-time

    this.state = this.getInitialState();
    this.hourDuration = 2500;

    this.stateChangedSource = new Subject<number>();
    this.stateChanged = this.stateChangedSource.asObservable();

    this.setChangeStateTimeout();

    this.stateChanged.subscribe(newState => {
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

    // testing

    this.testState = this.getInitialState();
    this.testData = new Array(this.coefficients.length).fill(0);
    const coefN = 0;
    const coefT = 10000;
    let lastStateChange = 0;

    this.stateChangedTestSource = new Subject<number>();
    this.stateChangedTest = this.stateChangedTestSource.asObservable();

    this.setChangeStateTimeout(true);

    let subscription = this.stateChangedTest.subscribe(newTestState => {
      this.testState = newTestState;
      this.setChangeStateTimeout(true);
    });

    setTimeout(
      () => {
        subscription.unsubscribe();
        lastStateChange = Date.now();
        
        this.setChangeStateTimeout(true);

        subscription = this.stateChangedTest.subscribe(newState => {
          this.testData[this.testState] += Date.now() - lastStateChange;
          this.testState = newState;
          lastStateChange = Date.now();
          this.setChangeStateTimeout(true);

          console.log(
            (this.testData[0] / this.testData.reduce((a, b) => a + b)).toFixed(2),
            (this.testData[1] / this.testData.reduce((a, b) => a + b)).toFixed(2),
            (this.testData[2] / this.testData.reduce((a, b) => a + b)).toFixed(2),
            this.testData
          );
        });
      },
      coefN
    );
  }


  setChangeStateTimeout(test = false): void {
    setTimeout(
      () => {
        this.changeState(test)
      },
      this.getTimeInterval(test)
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

    const distribution = lusolve(parameters, terms);

    const alpha = Math.random();
    let curProbability = 0;

    for (const [index, value] of (distribution as number[]).entries()) {
      curProbability += value[0];

      if (alpha < curProbability) {
        return index;
      }
    }

    return 0;
  }

  getTimeInterval(test: boolean): number {
    if (test) {
      return Math.log(Math.random()) / this.coefficients[this.testState][this.testState];
    }

    return Math.log(Math.random()) / this.coefficients[this.state][this.state] * this.hourDuration;
  }

  changeState(test: boolean): void {
    const distribution = new Array();

    for (const [index] of this.coefficients.entries()) {
      if (test) {
        distribution.push(index == this.testState ? 0 : -this.coefficients[this.testState][index] / this.coefficients[this.testState][this.testState]);
      }
      else {
        distribution.push(index == this.state ? 0 : -this.coefficients[this.state][index] / this.coefficients[this.state][this.state]);
      }
    }

    const alpha = Math.random();
    let curProbability = 0;

    for (const [index, value] of distribution.entries()) {
      curProbability += value;

      if (alpha < curProbability) {
        if (test) {
          this.stateChangedTestSource.next(index);
        }
        else {
          this.stateChangedSource.next(index);
        }

        break;
      }
    }
  }

}
