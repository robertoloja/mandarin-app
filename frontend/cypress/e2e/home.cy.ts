import { MAX_LENGTH_FREE } from 'constant_variables';

type HomeFixture = {
  text: string;
  pronunciation: string;
  definition: string;
};

describe('home page', () => {
  const inputTestText = () => {
    cy.fixture('home').then((data) => {
      const testString = data.map((item: HomeFixture) => item.text).join('');
      cy.get('input[name="sentence-input"]').type(testString);
      cy.get('form').submit();
      cy.contains(testString.length); // Word count
      cy.contains('It works.'); // Translation

      for (const word of data) {
        cy.get('[aria-label="mandarin sentence"]');
        cy.get(`[aria-label="word card: ${word.text}"]`).click();
        cy.contains(`${word.text}`);
        cy.contains(`${word.pronunciation}`);
        cy.contains(`${word.definition}`);
        cy.get('button[aria-label="close definition"').click();
      }
    });
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should give character limit warning to anonymous user', () => {
    cy.get('input[name="sentence-input"]').type(
      Array(MAX_LENGTH_FREE + 2).join('a'),
    );
    cy.contains('Unregistered users are limited to 200 characters per usage.');
    cy.contains('More info.');
    cy.get('[aria-label="subscription information link"]').click();
    cy.url().should('include', '/about#support');
  });

  it('should have working language menu', () => {
    inputTestText();

    cy.get('[aria-label="language settings"]').click();
    cy.contains('pīnyīn');
    cy.contains('ㄅㄆㄇㄈ');
    cy.contains('pin1yin1');
    cy.contains('Language Options');

    cy.get('[aria-label="toggle pinyin and bopomofo"]').click({ force: true });
    cy.contains('ㄓㄜˋ');
    cy.contains('ㄏㄠˇ');
    cy.contains('ㄩㄥˋ');
    cy.get('[aria-label="toggle pinyin and bopomofo"]').click({ force: true });
    cy.get('[aria-label="toggle accented to numbered pinyin"]').click({
      force: true,
    });
    cy.contains('zhe4');
    cy.contains('hao3');
    cy.contains('yong4');
  });

  it('should have working share button', () => {
    inputTestText();

    cy.get('[aria-label="share segmentation"]').click();
    cy.contains('Share Segmented Sentence');
    cy.get('[aria-label="copy link to clipboard"]');

    const shareLink = new RegExp(
      /^http:\/\/localhost:3000\/\?share_id=[A-Za-z!_-\d]{10}$/,
    );
    cy.get('[aria-label="share link"]')
      .invoke('val')
      .should('match', shareLink);
  });
});

// TODO:  Settings, Logout, Sentence History
