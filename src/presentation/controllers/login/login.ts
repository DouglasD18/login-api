import { Controller, EmailValidator, HttpRequest, HttpResponse } from '../../protocols';
import { badRequest } from '../../helpers/http';
import { MissingParamError } from '../../errors';

export class LoginController implements Controller {
  constructor(private emailValidator: EmailValidator) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    if (!httpRequest.body.email) {
      return new Promise(resolve => resolve(badRequest(new MissingParamError("email"))));
    }
    if (!httpRequest.body.password) {
      return new Promise(resolve => resolve(badRequest(new MissingParamError("password"))));
    }
    this.emailValidator.isValid(httpRequest.body.email);
  }
}