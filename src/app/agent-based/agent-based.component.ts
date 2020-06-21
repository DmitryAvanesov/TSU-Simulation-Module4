import { Component, OnInit } from '@angular/core';

interface IAgentCustomer {
  requestSize: number,
  isScandalous: boolean
}

interface IAgentEmployee {
  handleSpeed: number,
  customer: IAgentCustomer,
  timePassed: number,
  getTime(): number
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

  ngOnInit(): void {
    this.numberOfStaff = 5;
    this.staff = new Array(this.numberOfStaff);
    this.queue = new Array();
    this.queueIntensity = 0.0004;

    for (const [index] of this.staff.entries()) {
      this.staff[index] = {
        handleSpeed: Math.random(),
        customer: undefined,
        timePassed: 0,
        getTime: function () {
          if (this.customer) {
            return (this.handleSpeed + this.customer.requestSize) * 10000 - this.timePassed;
          }

          return 0;
        }
      };
    }

    this.fillQueue();
    this.getNextEvent();
  }

  fillQueue() {
    setTimeout(
      () => {
        this.queue.push({
          requestSize: Math.random(),
          isScandalous: Math.random() < 0.1
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
      const curTime = value.getTime();

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
