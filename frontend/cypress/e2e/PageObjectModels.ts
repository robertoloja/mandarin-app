export class HomePage {
  static visit() {
    cy.visit('/');
  }
}

export class TopNav {
  static menuButton() {
    return cy.get('[aria-label="open Navigation"]');
  }
  static openNav() {
    TopNav.menuButton().click();
  }
}

export class NavPanel {
  static logInLink() {
    return cy.get('[aria-label="login page link"]');
  }
  static closeButton() {
    return cy.get('[aria-label="close nav panel"]');
  }
}

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
    NavPanel.logInLink().click();
  }
  static forgotPasswordLink() {
    return cy.get('[aria-label="forgot password link"]');
  }
}
