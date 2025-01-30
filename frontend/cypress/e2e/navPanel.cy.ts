import { NavPanel } from './PageObjects/NavPanelPageObject';
import { TopNav } from './PageObjects/TopNavPageObject';

describe('nav panel', () => {
  beforeEach(() => {
    TopNav.openNav();
  });

  it('should be able to click every link in the nav panel', () => {
    const navPanelLinks = [
      NavPanel.homeLink(),
      NavPanel.readingRoomLink(),
      NavPanel.sentenceHistoryLink(),
      NavPanel.aboutPageLink(),
      NavPanel.loginPageLink(),
    ];

    for (const link of navPanelLinks) {
      link.click();
      TopNav.openNav();
    }
    NavPanel.closeButton().click();
  });
});
