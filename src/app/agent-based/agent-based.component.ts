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
  staff: Array<IAgentEmployee>;
  queue: Array<IAgentCustomer>;
  queueIntensity: number;
  staffIntensity: number;
  distribution: Array<number>;

  ngOnInit(): void {
    this.numberOfStaff = 20;
    this.staff = new Array(this.numberOfStaff);
    this.queue = new Array();
    this.queueIntensity = 0.00095;
    this.staffIntensity = 0.0001;
    this.distribution = new Array(50);

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
    }

    const intensityRatio = this.queueIntensity / (this.staffIntensity * 0.5);
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

    console.log(this.distribution)

    this.fillQueue();
    this.getNextEvent();
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

  getNextEvent(curAgent: number = undefined) {
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
          this.staff[nextAgent].timePassed = 0;
          this.staff[nextAgent].customer = this.queue[0];
          this.queue.shift();
        }
        else {
          this.staff[nextAgent].customer = undefined;
        }

        this.getNextEvent(nextAgent);
      },
      minTime
    );
  }

}
