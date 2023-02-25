import { Controller, EmailValidator, HttpRequest, HttpResponse } from '../../protocols';
import { badRequest } from '../../helpers/http';
import { InvalidParamError, MissingParamError } from '../../errors';

export class LoginController implements Controller {
  constructor(private emailValidator: EmailValidator) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { body: { email, password } } = httpRequest;

    if (!email) {
      return new Promise(resolve => resolve(badRequest(new MissingParamError("email"))));
    }
    if (!password) {
      return new Promise(resolve => resolve(badRequest(new MissingParamError("password"))));
    }
    const isValid = this.emailValidator.isValid(email);
    if (!isValid) {
      return new Promise(resolve => resolve(badRequest(new InvalidParamError("email"))));
    }
  }
}