import about_status from './about_status';
import nav_panel from './nav_panel';
import top_nav from './top_nav';
import reading_room from './reading_room';
import sentence_history from './sentence_history';
import home_page from './home_page';
import login_page from './login_page';
import account_settings from './account_settings';
import registration_page from './registration_page';

const languages = [
  { code: 'en', label: { en: 'English', de: 'Englisch' } },
  { code: 'de', label: { en: 'German', de: 'Deutsch' } },
] as const;

export type UserLanguage = (typeof languages)[number]['code'];

const localization = {
  languages,
  home_page,
  about_status,
  nav_panel,
  top_nav,
  reading_room,
  sentence_history,
  login_page,
  account_settings,
  registration_page: registration_page,
};

export default localization;
