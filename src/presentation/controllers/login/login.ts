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
      const requiredFields = ["email", "password"];
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field));
        }
      }

      const { body: { email, password } } = httpRequest;

      const isValid = this.emailValidator.isValid(email);
      if (!isValid) {
        return badRequest(new InvalidParamError("email"));
      }

      await this.authentication.auth(email, password);
    } catch (error) {
      return serverError(new ServerError(error.stack));
    }
  }
}