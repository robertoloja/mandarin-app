import { ReadingPage } from './PageObjects/ReadingPageObject';

describe('reading room', () => {
  beforeEach(() => {
    ReadingPage.visit();
  });

  it('should go to title meaning', () => {
    ReadingPage.covers().each(($child) => {
      cy.wrap($child)
        .find('[aria-label="english heading"]')
        .first()
        .invoke('text')
        .then((textHeading) => {
          cy.wrap($child)
            .find('[aria-label="mandarin heading"]')
            .first()
            .click();

          cy.contains(textHeading).should('be.visible');
        });
    });
  });

  it('should display previous and next arrows, and paginate', () => {
    ReadingPage.nextArrow().click();
    ReadingPage.previousArrow().click();
  });
});
