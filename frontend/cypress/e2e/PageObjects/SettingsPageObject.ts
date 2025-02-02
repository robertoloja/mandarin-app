export class SettingsPage {
  static visit() {
    cy.visit('/settings');
  }
  static username() {
    cy.get('[aria-label="username display"]');
  }
  static password() {
    cy.get('[aria-label="email display"]');
  }
  static changePasswordLink() {
    cy.get('[aria-label="change password link"]');
  }
  static changePronunciation() {
    cy.get('[aria-label="toggle pinyin to bopomofo"]');
  }
  static changePinyin() {
    cy.get('[aria-label="toggle accented to numbered pinyin"]');
  }
}
