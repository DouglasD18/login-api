import { LoginController } from "./login";
import { badRequest, serverError } from '../../helpers/http';
import { InvalidParamError, MissingParamError } from "../../errors";
import { EmailValidator } from '../../protocols/email-validator';
import { HttpRequest } from '../../protocols/http';
import { Authentication } from "../../../domain/useCases/authentication";

const makeEmailValidatorStub = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }

  return new EmailValidatorStub();
}

const makeAuthenticationStub = (): Authentication => {
  class AuthenticationStub implements Authentication {
    auth(email: string, password: string): Promise<string> {
      return new Promise(resolve => resolve("any_token"));
    }
  }

  return new AuthenticationStub();
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    email: "valid@mail.com",
    password: "valid_password"
  }
})

interface SutTypes {
  sut: LoginController
  emailValidatorStub: EmailValidator
  authenticationStub: Authentication
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidatorStub();
  const authenticationStub = makeAuthenticationStub();
  const sut = new LoginController(emailValidatorStub, authenticationStub);

  return {
    sut,
    emailValidatorStub,
    authenticationStub
  }
}

describe("Login Controller", () => {
  it("Should return 400 if no email is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        password: "valid_password"
      }
    }

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse).toEqual(badRequest(new MissingParamError("email")));
  })

  it("Should return 400 if no password is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: "valid@mail.com"
      }
    }

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse).toEqual(badRequest(new MissingParamError("password")));
  })

  it("Should call EmailValidator with correct email", async () => {
    const { sut, emailValidatorStub } = makeSut();

    const isValidSpy = jest.spyOn(emailValidatorStub, "isValid");
    await sut.handle(makeFakeRequest());

    expect(isValidSpy).toHaveBeenCalledWith("valid@mail.com");
  })

  it("Should return 400 if an invalid email is provided", async () => {
    const { sut, emailValidatorStub } = makeSut();

    jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false);
    const httpResponse = await sut.handle(makeFakeRequest());

    expect(httpResponse).toEqual(badRequest(new InvalidParamError("email")));
  })

  it("Should return 500 if EmailValidator throws", async () => {
    const { sut, emailValidatorStub } = makeSut();

    jest.spyOn(emailValidatorStub, "isValid").mockImplementationOnce(() => {
      throw new Error();
    });
    const httpResponse = await sut.handle(makeFakeRequest());

    expect(httpResponse).toEqual(serverError(new Error()));
  })

  it("Should call Authetication with correct email", async () => {
    const { sut, authenticationStub } = makeSut();

    const authSpy = jest.spyOn(authenticationStub, "auth");
    await sut.handle(makeFakeRequest());

    expect(authSpy).toHaveBeenCalledWith("valid@mail.com", "valid_password");
  })
})