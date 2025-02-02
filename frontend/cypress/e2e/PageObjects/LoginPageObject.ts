import { NavPanel } from './NavPanelPageObject';
import { TopNav } from './TopNavPageObject';

export class LoginPage {
  static visit() {
    cy.visit('/auth');
  }
  static usernameField() {
    return cy.get('[aria-label="username input"]');
  }
  static passwordField() {
    return cy.get('[aria-label="password input"]');
  }
  static submitButton() {
    return cy.get('[aria-label="submit button"]');
  }
  static login(username: string, password: string) {
    LoginPage.visit();
    LoginPage.usernameField().type(username);
    LoginPage.passwordField().type(password);
    LoginPage.submitButton().click();
  }
  static logout() {
    TopNav.openNav();
    cy.contains('Log Out');
    NavPanel.loginPageLink().click();
  }
  static forgotPasswordLink() {
    return cy.get('[aria-label="forgot password link"]');
  }
}
