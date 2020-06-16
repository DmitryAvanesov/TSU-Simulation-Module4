import { Injectable } from '@angular/core';
import { lusolve, random } from 'mathjs';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  coefficients: Array<Array<number>>;
  hourDuration: number;

  stateChangedSource: Subject<number>;
  stateChanged: Observable<number>;

  constructor() {
    this.coefficients = new Array(new Array(-0.4, 0.3, 0.1), new Array(0.4, -0.8, 0.4), new Array(0.1, 0.4, -0.5));
    this.hourDuration = 1000;

    this.stateChangedSource = new Subject<number>();
    this.stateChanged = this.stateChangedSource.asObservable();
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

  getTimeInterval(state: number): number {
    return Math.log(Math.random()) / this.coefficients[state][state] * this.hourDuration;
  }

  changeState(state: number): void {
    const distribution = new Array();

    for (const [index] of this.coefficients.entries()) {
      distribution.push(index == state ? 0 : -this.coefficients[state][index] / this.coefficients[state][state]);
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
