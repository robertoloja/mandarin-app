describe('nav panel', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should be able to click every link in the nav panel', () => {
    cy.get('[aria-label="open Navigation"]').click();

    const navPanelLinks = [
      'home link',
      'reading room link',
      'sentence history link',
      'about page link',
      'bug report link',
      'login page link',
    ];

    for (const link of navPanelLinks) {
      if (link !== 'bug report link') {
        cy.get(`[aria-label="${link}"]`).click();
        cy.get('[aria-label="open Navigation"]').click();
      }
    }
    cy.get('[aria-label="close nav panel"]').click();
  });
});

// TODO: Login, Settings, Logout
