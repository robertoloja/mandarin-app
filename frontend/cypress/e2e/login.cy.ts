import { LoginPage } from './PageObjects/LoginPageObject';

describe('login page', () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  it('should not be able to login with invalid credentials', () => {
    LoginPage.login('foo', 'bar');
    cy.contains('Invalid credentials');
  });

  it('should be able to login with valid credentials, then logout', () => {
    LoginPage.login('robertoloja', 'OZHk4L8G-SZJ2vHGAv-r');
    cy.contains('Settings');
    LoginPage.logout();
  });

  it('should be able to reset password', () => {
    LoginPage.forgotPasswordLink().click();
    cy.contains('Username is required');
    LoginPage.usernameField().type('admin');
    LoginPage.forgotPasswordLink().click();
    cy.contains('Password reset e-mail will be sent.');
  });
});
