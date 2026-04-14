import about_status from './about_status';
import nav_panel from './nav_panel';
import top_nav from './top_nav';
import reading_room from './reading_room';
import sentence_history from './sentence_history';
import home_page from './home_page';
import login_page from './login_page';
import account_settings from './account_settings';

const localization = {
  languages: [
    { code: 'en', label: { en: 'English', de: 'Englisch' } },
    { code: 'de', label: { en: 'German', de: 'Deutsch' } },
  ],
  home_page: home_page,
  about_status: about_status,
  nav_panel: nav_panel,
  top_nav: top_nav,
  reading_room: reading_room,
  sentence_history: sentence_history,
  login_page: login_page,
  account_settings: account_settings,
};

export default localization;
