export class Logger {
  private getTime(): string {
    return new Date().toISOString();
  }

  info(message: string): void {
    console.log(`[${this.getTime()}] [INFO]: ${message}`);
  }

  warn(message: string): void {
    console.warn(`[${this.getTime()}] [WARN]: ${message}`);
  }

  error(message: string): void {
    console.error(`[${this.getTime()}] [ERROR]: ${message}`);
  }
}
