export class HomePage {
  static visit() {
    cy.visit('/');
  }
  static sentenceInputBar() {
    return cy.get('input[name="sentence-input"]');
  }
  static form() {
    return cy.get('form');
  }
  static mandarinSentence() {
    return cy.get('[aria-label="mandarin sentence"]');
  }
  static mandarinWordCard(word: string) {
    return cy.get(`[aria-label="word card: ${word}"]`);
  }
  static closeDefinition() {
    cy.get('button[aria-label="close definition"').click();
  }
  static subscriptionLink() {
    cy.contains('Unregistered users are limited to 200 characters per usage.');
    cy.contains('More info.');
    return cy.get('[aria-label="subscription information link"]');
  }
  static inputText(text: string) {
    HomePage.sentenceInputBar().type(text);
    HomePage.form().submit();
  }
}
