import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-point-process',
  templateUrl: './point-process.component.html',
  styleUrls: ['./point-process.component.scss']
})
export class PointProcessComponent implements OnInit {

  intensityFirst: number;
  intensitySecond: number;
  time: number;
  amounts: Array<number>;
  names: Array<string>;
  lastFlow: number;

  ngOnInit(): void {
    this.intensityFirst = 0.0005;
    this.intensitySecond = 0.0015;
    this.time = Date.now();
    this.amounts = new Array(4).fill(0);
    this.names = new Array(
      `Flow 1 (Intensity = ${this.intensityFirst})`,
      `Flow 2 (Intensity = ${this.intensitySecond})`,
      `Total flow for Flow 1 and Flow 2`,
      `Flow 3 (Intensity = ${this.intensityFirst + this.intensitySecond})`
    );

    this.setNextPoint(this.intensityFirst);
    this.setNextPoint(this.intensitySecond);
    this.setNextPoint(this.intensityFirst + this.intensitySecond);
  }

  setNextPoint(intensity: number): void {
    setTimeout(
      () => {
        if (intensity == this.intensityFirst) {
          this.amounts[0]++;
          this.amounts[2]++;
          this.lastFlow = 0;
        }
        else if (intensity == this.intensitySecond) {
          this.amounts[1]++;
          this.amounts[2]++;
          this.lastFlow = 1;
        }
        else {
          this.amounts[3]++;
          this.lastFlow = 3;
        }

        this.setNextPoint(intensity);
      },
      -Math.log(Math.random()) / intensity
    );
  }

}
