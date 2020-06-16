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
  testData: Array<number>;

  coefficients: Array<Array<number>>;
  hourDuration: number;

  stateChangedSource: Subject<number>;
  stateChanged: Observable<number>;
  stateChangedTestSource: Subject<number>;
  stateChangedTest: Observable<number>;

  ngOnInit(): void {
    this.coefficients = new Array(new Array(-0.4, 0.3, 0.1), new Array(0.4, -0.8, 0.4), new Array(0.1, 0.4, -0.5));
    this.hourDuration = 2500;

    this.stateChangedSource = new Subject<number>();
    this.stateChanged = this.stateChangedSource.asObservable();
    this.stateChangedTestSource = new Subject<number>();
    this.stateChangedTest = this.stateChangedTestSource.asObservable();

    // real-time

    this.state = this.getInitialState();
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

    const N = 20000;
    const T = 10000;

    this.setChangeStateTimeout(true);

    let subscription = this.stateChangedTest.subscribe(() => {
      this.setChangeStateTimeout(true);
    });

    setTimeout(
      () => {
        subscription.unsubscribe();
        this.setChangeStateTimeout(true);

        subscription = this.stateChangedTest.subscribe(newState => {

          this.setChangeStateTimeout(true);
        });
      },
      N
    );
  }

  setChangeStateTimeout(test = false): void {
    setTimeout(
      () => {
        this.changeState(this.state, test)
      },
      this.getTimeInterval(this.state, test)
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

  getTimeInterval(state: number, test = false): number {
    if (test) {
      return Math.log(Math.random()) / this.coefficients[state][state];
    }

    return Math.log(Math.random()) / this.coefficients[state][state] * this.hourDuration;
  }

  changeState(state: number, test = false): void {
    const distribution = new Array();

    for (const [index] of this.coefficients.entries()) {
      distribution.push(index == state ? 0 : -this.coefficients[state][index] / this.coefficients[state][state]);
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
