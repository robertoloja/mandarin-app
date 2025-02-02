import { NavPanel } from './PageObjects/NavPanelPageObject';
import { TopNav } from './PageObjects/TopNavPageObject';

describe('nav panel', () => {
  beforeEach(() => {
    TopNav.openNav();
  });

  it('should be able to click every link in the nav panel', () => {
    const navPanelLinks: [Cypress.Chainable<JQuery<HTMLElement>>, string][] = [
      [NavPanel.homeLink(), '/'],
      [NavPanel.readingRoomLink(), '/reading'],
      [NavPanel.sentenceHistoryLink(), '/history'],
      [NavPanel.aboutPageLink(), '/about'],
      [NavPanel.loginPageLink(), '/auth'],
    ];

    for (const link of navPanelLinks) {
      TopNav.openNav();
      link[0].click();
      cy.url().should('include', link[1]);
    }
  });
});
