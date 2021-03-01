export interface IError {
  status: number;
  message: string;
}

export class RquestError implements IError {
  readonly status = 400;
  constructor(readonly message: string) {}
}

export class ProcessError implements IError {
  readonly status = 500;
  constructor(readonly message: string) {}
}
