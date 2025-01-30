export class NavPanel {
  static logInLink() {
    return cy.get('[aria-label="login page link"]');
  }
  static closeButton() {
    return cy.get('[aria-label="close nav panel"]');
  }
}
