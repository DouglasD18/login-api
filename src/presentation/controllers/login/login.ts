import { Authentication, Controller, EmailValidator, HttpRequest, HttpResponse, InvalidParamError, MissingParamError, ServerError, badRequest, serverError, unauthorized } from "./login-protocols";


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

      const accessToken = await this.authentication.auth(email, password);
      if (!accessToken) {
        return unauthorized();
      }
    } catch (error) {
      return serverError(new ServerError(error.stack));
    }
  }
}