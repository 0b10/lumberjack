export class LumberjackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LumberjackError";
  }
}
