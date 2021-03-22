import AuthenticationService from "./authentication.service";
import TokenService from "./token.service";
class Service {
  constructor() {
    this.Authentication = new AuthenticationService();
    // this.Token = new TokenService();
  }
}
export default new Service();
