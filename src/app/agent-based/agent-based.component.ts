import { Component, OnInit } from '@angular/core';
import { factorial } from 'mathjs';

interface IContext {
  staffIntensity: number
}

interface IAgentCustomer {
  requestSize: number,
  isScandalous: boolean
}

interface IAgentEmployee {
  handleSpeed: number,
  customer: IAgentCustomer,
  timePassed: number,
  getTime(context: IContext): number
}

@Component({
  selector: 'app-agent-based',
  templateUrl: './agent-based.component.html',
  styleUrls: ['./agent-based.component.scss']
})
export class AgentBasedComponent implements OnInit {

  numberOfStaff: number;
  numberOfActiveStaff: number;
  staff: Array<IAgentEmployee>;
  averageHandleSpeed: number;
  queue: Array<IAgentCustomer>;
  queueIntensity: number;
  staffIntensity: number;
  distributionSize: number;
  distribution: Array<number>;
  testInterval: number;
  testAmount: number;
  testDistribution: Array<number>;
  average: number;
  variance: number;
  averageError: number;
  varianceError: number;

  ngOnInit(): void {
    this.numberOfStaff = 20;
    this.numberOfActiveStaff = 0;
    this.staff = new Array(this.numberOfStaff);
    this.averageHandleSpeed = 0;
    this.queue = new Array();
    this.queueIntensity = 0.0007;
    this.staffIntensity = 0.000075;
    this.distributionSize = 50;
    this.distribution = new Array(this.distributionSize);
    this.testInterval = 1000;
    this.testAmount = 0;
    this.testDistribution = new Array(this.distributionSize).fill(0);
    this.average = 0;
    this.variance = 0;

    for (const [index] of this.staff.entries()) {
      this.staff[index] = {
        handleSpeed: Math.random() / 2 + 0.5,
        customer: undefined,
        timePassed: 0,
        getTime: function (context) {
          if (this.customer) {
            if (this.customer.isScandalous) {
              return -Math.log(Math.random()) / context.staffIntensity * (this.handleSpeed + this.customer.requestSize) * 5 - this.timePassed;
            }

            return -Math.log(Math.random()) / context.staffIntensity * (this.handleSpeed + this.customer.requestSize) - this.timePassed;
          }

          return 0;
        }
      };

      this.averageHandleSpeed += this.staff[index].handleSpeed;
    }

    this.averageHandleSpeed /= this.numberOfStaff;

    const intensityRatio = this.queueIntensity / (this.staffIntensity / ((this.averageHandleSpeed + 1) * 1.2));
    let probabilityBase = 0;

    for (let i = 0; i <= this.numberOfStaff; i++) {
      probabilityBase += Math.pow(intensityRatio, i) / factorial(i);
    }

    probabilityBase = Math.pow(probabilityBase + Math.pow(intensityRatio, this.numberOfStaff + 1) / (factorial(this.numberOfStaff) * (this.numberOfStaff - intensityRatio)), -1);

    for (const [index] of this.distribution.entries()) {
      this.distribution[index] = index < this.numberOfStaff
        ? Math.pow(intensityRatio, index) * probabilityBase / factorial(index)
        : Math.pow(intensityRatio, index) * probabilityBase / (factorial(this.numberOfStaff) * Math.pow(this.numberOfStaff, index - this.numberOfStaff));
    }

    this.distribution[this.distributionSize - 1] += 1 - this.distribution.reduce((a, b) => a + b);

    for (const [index, value] of this.distribution.entries()) {
      this.average += index * value;
    }

    for (const [index] of this.distribution.entries()) {
      this.variance += Math.pow(index * this.average, 2);
    }

    this.variance /= this.distributionSize - 1;

    this.fillQueue();
    this.getNextEvent();

    setInterval(
      () => {
        this.testDistribution[Math.min(this.distributionSize - 1, this.numberOfActiveStaff + this.queue.length)]++;
        this.testAmount++;

        let testAverage = 0;

        for (const [index, value] of this.testDistribution.entries()) {
          testAverage += index * (value / this.testAmount);
        }

        let testVariance = 0;

        for (const [index] of this.testDistribution.entries()) {
          testVariance += Math.pow(index * testAverage, 2);
        }

        testVariance /= this.distributionSize - 1;

        this.averageError = Math.abs(testAverage - this.average) / Math.abs(this.average);
        this.varianceError = Math.abs(testVariance - this.variance) / Math.abs(this.variance);
      },
      this.testInterval
    );
  }

  fillQueue() {
    setTimeout(
      () => {
        this.queue.push({
          requestSize: Math.random() + 0.5,
          isScandalous: Math.random() < 0.05
        });

        this.fillQueue();
      },
      -Math.log(Math.random()) / this.queueIntensity
    );
  }

  getNextEvent() {
    let minTime = 10e10;
    let nextAgent = 0;

    for (const [index, value] of this.staff.entries()) {
      const curTime = value.getTime(this);

      if (curTime < minTime) {
        minTime = curTime;
        nextAgent = index;
      }
    }

    for (const [index, value] of this.staff.entries()) {
      if (value.customer) {
        this.staff[index].timePassed += minTime;
      }
    }

    setTimeout(
      () => {
        if (this.queue.length > 0) {
          if (!this.staff[nextAgent].customer) {
            this.numberOfActiveStaff++;
          }

          this.staff[nextAgent].timePassed = 0;
          this.staff[nextAgent].customer = this.queue[0];
          this.queue.shift();
        }
        else {
          if (this.staff[nextAgent].customer) {
            this.numberOfActiveStaff--;
          }

          this.staff[nextAgent].customer = undefined;
        }

        this.getNextEvent();
      },
      minTime
    );
  }

}
