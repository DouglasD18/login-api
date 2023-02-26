import { Controller, EmailValidator, HttpRequest, HttpResponse } from '../../protocols';
import { badRequest, serverError } from '../../helpers/http';
import { InvalidParamError, MissingParamError, ServerError } from '../../errors';

export class LoginController implements Controller {
  constructor(private emailValidator: EmailValidator) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
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
    } catch (error) {
      return serverError(new ServerError(error.stack));
    }
  }
}