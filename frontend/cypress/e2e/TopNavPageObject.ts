export class TopNav {
  static menuButton() {
    return cy.get('[aria-label="open Navigation"]');
  }
  static openNav() {
    TopNav.menuButton().click();
  }
  static languageButton() {
    return cy.get('[aria-label="language settings"]');
  }
  static pronunciationSwitch() {
    return cy.get('[aria-label="toggle pinyin and bopomofo"]');
  }
  static togglePronunciation() {
    TopNav.pronunciationSwitch().click({ force: true });
  }
  static pinyinSwitch() {
    return cy.get('[aria-label="toggle accented to numbered pinyin"]');
  }
  static togglePinyin() {
    TopNav.pinyinSwitch().click({ force: true });
  }
  static shareButton() {
    return cy.get('[aria-label="share segmentation"]');
  }
  static copyLinkButton() {
    return cy.get('[aria-label="share segmentation"]');
  }
  static shareLink() {
    return cy.get('[aria-label="share link"]').invoke('val');
  }
}
