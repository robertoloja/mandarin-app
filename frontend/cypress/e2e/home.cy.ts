import { MAX_LENGTH_FREE } from 'constant_variables';
import { HomePage } from './PageObjects/HomePageObject';
import { TopNav } from './PageObjects/TopNavPageObject';

type HomeFixture = {
  text: string;
  pronunciation: string;
  definition: string;
};

describe('home page', () => {
  const inputTestText = () => {
    cy.fixture('home').then((data: HomeFixture[]) => {
      const testString = data.map((item) => item.text).join('');
      HomePage.inputText(testString);
      cy.contains(testString.length); // Word count
      cy.contains('It works.'); // Translation

      for (const word of data) {
        HomePage.mandarinSentence();
        HomePage.mandarinWordCard(word.text).click();
        cy.contains(`${word.text}`);
        cy.contains(`${word.pronunciation}`);
        cy.contains(`${word.definition}`);
        HomePage.closeDefinition();
      }
    });
  };

  beforeEach(() => {
    HomePage.visit();
  });

  it('should give character limit warning to anonymous user', () => {
    HomePage.sentenceInputBar().type(Array(MAX_LENGTH_FREE + 2).join('a'));
    HomePage.subscriptionLink().click();
    cy.url().should('include', '/about#support');
  });

  it('should have working language menu', () => {
    inputTestText();

    TopNav.languageButton().click();
    cy.contains('pīnyīn');
    cy.contains('ㄅㄆㄇㄈ');
    cy.contains('pin1yin1');
    cy.contains('Language Options');

    TopNav.togglePronunciation();
    cy.contains('ㄓㄜˋ');
    cy.contains('ㄏㄠˇ');
    cy.contains('ㄩㄥˋ');
    TopNav.togglePronunciation();
    TopNav.togglePinyin();
    cy.contains('zhe4');
    cy.contains('hao3');
    cy.contains('yong4');
  });

  it('should have working share button', () => {
    inputTestText();

    TopNav.shareButton().click();
    cy.contains('Share Segmented Sentence');
    cy.get('[aria-label="copy link to clipboard"]');

    const shareLink = new RegExp(
      /^http:\/\/localhost:3000\/\?share_id=[A-Za-z!_-\d]{10}$/,
    );
    TopNav.shareLink().should('match', shareLink);
  });
});
