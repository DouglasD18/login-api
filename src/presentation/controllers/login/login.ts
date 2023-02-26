import { Controller, EmailValidator, HttpRequest, HttpResponse } from '../../protocols';
import { badRequest, serverError } from '../../helpers/http';
import { InvalidParamError, MissingParamError, ServerError } from '../../errors';
import { Authentication } from '../../../domain/useCases/authentication';

export class LoginController implements Controller {
  constructor(
    private emailValidator: EmailValidator,
    private authentication: Authentication
  ) {}

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

      await this.authentication.auth(email, password);
    } catch (error) {
      return serverError(new ServerError(error.stack));
    }
  }
}