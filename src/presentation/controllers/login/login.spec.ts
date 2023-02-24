import { LoginController } from "./login";
import { badRequest } from '../../helpers/http';
import { MissingParamError } from "../../errors";

describe("Login Controller", () => {
  it("Should return 400 if no email is provided", async () => {
    const sut = new LoginController();
    const httpRequest = {
      body: {
        password: "valid_password"
      }
    }

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse).toEqual(badRequest(new MissingParamError("email")));
  })
})