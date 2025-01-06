'use client';

export default class AccurateTimer {
  private startTime: number | null = null;
  private elapsedTime: number = 0;
  private timerId: number | null = null;

  start(): void {
    if (this.timerId !== null) {
      throw new Error('Timer is already running.');
    }
    if (typeof window !== 'undefined') {
      this.startTime = performance.now();
      this.timerId = window.setInterval(() => {
        if (this.startTime !== null) {
          this.elapsedTime = performance.now() - this.startTime;
        }
      }, 1);
    }
  }

  stop(): void {
    if (this.startTime !== null) {
      this.elapsedTime = performance.now() - this.startTime;
    }
    clearInterval(this.timerId);
    this.timerId = null;
  }

  reset(): void {
    this.startTime = null;
    this.elapsedTime = 0;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  getElapsedTime(): number {
    return this.elapsedTime;
  }
}

const timer = new AccurateTimer();
timer.start();

setTimeout(() => {
  timer.stop();
  console.log('Elapsed time (ms):', timer.getElapsedTime());
}, 500);
