export class ReadingPage {
  static visit() {
    cy.visit('/reading');
  }
  static covers() {
    return cy.get('[aria-label="text container"]');
  }
  static nextArrow() {
    return cy.get('[aria-label="next page"]').first();
  }
  static previousArrow() {
    return cy.get('[aria-label="previous page"]').first();
  }
}
