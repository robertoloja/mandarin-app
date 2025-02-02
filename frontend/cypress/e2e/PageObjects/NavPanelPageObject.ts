export class NavPanel {
  static closeButton() {
    return cy.get('[aria-label="close nav panel"]');
  }
  static homeLink() {
    return cy.get('[aria-label="home link"]');
  }
  static readingRoomLink() {
    return cy.get('[aria-label="reading room link"]');
  }
  static sentenceHistoryLink() {
    return cy.get('[aria-label="sentence history link"]');
  }
  static aboutPageLink() {
    return cy.get('[aria-label="about page link"]');
  }
  static loginPageLink() {
    return cy.get('[aria-label="login page link"]');
  }
}
