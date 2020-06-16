import { Injectable } from '@angular/core';
import { lusolve } from 'mathjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  coefficients: Array<Array<number>>;

  constructor() {
    this.coefficients = new Array(new Array(-0.4, 0.3, 0.1), new Array(0.4, -0.8, 0.4), new Array(0.1, 0.4, -0.5));
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

}
