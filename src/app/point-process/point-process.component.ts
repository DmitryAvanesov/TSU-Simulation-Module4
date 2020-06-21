import { Component, OnInit } from '@angular/core';
import { factorial } from 'mathjs';

@Component({
  selector: 'app-point-process',
  templateUrl: './point-process.component.html',
  styleUrls: ['./point-process.component.scss']
})
export class PointProcessComponent implements OnInit {

  intensityFirst: number;
  intensitySecond: number;
  statsInterval: number;
  statsData: Array<number>;
  statsAmount: number;
  intervalAmount: number;
  statsDataTotal: Array<number>;
  statsAmountTotal: number;
  intervalAmountTotal: number;
  averageReal: number;
  varianceReal: number;
  averageError: number;
  varianceError: number;
  averageErrorTotal: number;
  varianceErrorTotal: number;
  amounts: Array<number>;
  names: Array<string>;
  lastFlow: number;
  distribution: Array<number>;

  ngOnInit(): void {
    this.intensityFirst = 0.0007;
    this.intensitySecond = 0.0013;
    this.statsInterval = 1000;
    this.statsData = new Array(10).fill(0);
    this.statsAmount = 0;
    this.intervalAmount = 0;
    this.statsDataTotal = new Array(10).fill(0);
    this.statsAmountTotal = 0;
    this.intervalAmountTotal = 0;
    this.amounts = new Array(4).fill(0);
    this.names = new Array(
      `Flow 1 (Intensity = ${this.intensityFirst})`,
      `Flow 2 (Intensity = ${this.intensitySecond})`,
      `Total flow for Flow 1 and Flow 2`,
      `Flow 3 (Intensity = ${this.intensityFirst + this.intensitySecond})`
    );
    this.distribution = new Array<number>(10);

    for (const [index] of this.distribution.entries()) {
      this.distribution[index] = Math.pow((this.intensityFirst + this.intensitySecond) * this.statsInterval, index) * Math.pow(Math.E, -(this.intensityFirst + this.intensitySecond) * this.statsInterval) / factorial(index);
    }

    this.distribution[this.distribution.length - 1] += 1 - this.distribution.reduce((a, b) => a + b);

    this.averageReal = 0;

    for (const [index, value] of this.distribution.entries()) {
      this.averageReal += index * value;
    }

    this.varianceReal = 0;

    for (const [index] of this.distribution.entries()) {
      this.varianceReal += Math.pow(index * this.averageReal, 2);
    }

    this.varianceReal /= this.distribution.length - 1;

    this.setNextPoint(this.intensityFirst);
    this.setNextPoint(this.intensitySecond);
    this.setNextPoint(this.intensityFirst + this.intensitySecond);

    setInterval(
      () => {
        this.statsData[Math.min(this.intervalAmount, 9)]++;
        this.statsAmount++;
        this.intervalAmount = 0;

        this.statsDataTotal[Math.min(this.intervalAmountTotal, 9)]++;
        this.statsAmountTotal++;
        this.intervalAmountTotal = 0;

        let averageStats = 0;

        for (const [index, value] of this.statsData.entries()) {
          averageStats += index * (value / this.statsAmount);
        }

        let varianceStats = 0;

        for (const [index] of this.statsData.entries()) {
          varianceStats += Math.pow(index * averageStats, 2);
        }

        varianceStats /= this.distribution.length - 1;

        this.averageError = Math.abs(averageStats - this.averageReal) / Math.abs(this.averageReal);
        this.varianceError = Math.abs(varianceStats - this.varianceReal) / Math.abs(this.varianceReal);

        averageStats = 0;

        for (const [index, value] of this.statsDataTotal.entries()) {
          averageStats += index * (value / this.statsAmountTotal);
        }

        varianceStats = 0;

        for (const [index] of this.statsDataTotal.entries()) {
          varianceStats += Math.pow(index * averageStats, 2);
        }

        varianceStats /= this.distribution.length - 1;

        this.averageErrorTotal = Math.abs(averageStats - this.averageReal) / Math.abs(this.averageReal);
        this.varianceErrorTotal = Math.abs(varianceStats - this.varianceReal) / Math.abs(this.varianceReal);
      },
      this.statsInterval
    );
  }

  setNextPoint(intensity: number): void {
    setTimeout(
      () => {
        if (intensity == this.intensityFirst) {
          this.amounts[0]++;
          this.amounts[2]++;
          this.intervalAmountTotal++;
          this.lastFlow = 0;
        }
        else if (intensity == this.intensitySecond) {
          this.amounts[1]++;
          this.amounts[2]++;
          this.intervalAmountTotal++;
          this.lastFlow = 1;
        }
        else {
          this.amounts[3]++;
          this.intervalAmount++;
          this.lastFlow = 3;
        }

        this.setNextPoint(intensity);
      },
      -Math.log(Math.random()) / intensity
    );
  }

}