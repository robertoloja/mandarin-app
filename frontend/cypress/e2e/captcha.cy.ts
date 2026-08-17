import { HomePage } from './PageObjects/HomePageObject';

/**
 * Exercises the real Friendly Captcha flow against a live backend: the widget
 * solves a genuine proof of work, the solution is exchanged for a pass, and the
 * pass admits an anonymous visitor to /segment.
 *
 * Requires the backend running with FRIENDLY_CAPTCHA_ENABLED=True and a real
 * sitekey/API key configured.
 */
describe('friendly captcha', () => {
  it('solves, exchanges the solution for a pass, and segments with it', () => {
    cy.intercept('POST', '**/captcha/verify').as('verify');
    cy.intercept('POST', '**/segment*').as('segment');

    HomePage.visit();
    HomePage.inputText('这好用');

    // The proof of work is real, so give it room.
    cy.wait('@verify', { timeout: 60000 }).then(({ response }) => {
      expect(response?.statusCode, 'verify status').to.eq(200);
      expect(response?.body, 'pass issued').to.have.property('captcha_pass');
      expect(response?.body.captcha_pass, 'pass is non-empty').to.be.a('string')
        .and.not.be.empty;
      expect(response?.body, 'ttl returned').to.have.property('expires_in');
    });

    cy.wait('@segment', { timeout: 60000 }).then(({ request, response }) => {
      expect(request.headers, 'pass was attached').to.have.property(
        'x-captcha-pass',
      );
      expect(response?.statusCode, 'segment accepted the pass').to.eq(200);
    });

    // And the segmentation actually rendered.
    HomePage.mandarinSentence().should('exist');
  });

  it('refuses an anonymous segmentation carrying no pass', () => {
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/segment?data=%E4%BD%A0%E5%A5%BD',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status, 'gate is closed without a pass').to.eq(428);
    });
  });
});
