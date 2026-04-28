export const about_status = {
  bug_report: {
    title: {
      en: 'MandoBot Bug and Problem Report',
      de: 'MandoBot Fehlerbericht',
    },
    intro: {
      en: "Please include as much information as possible about the bug you've noticed.",
      de: 'Bitte geben Sie so viele Informationen wie möglich zu dem Fehler an, den Sie entdeckt haben.',
    },
    question: {
      en: 'In what part of the app did you find this bug?',
      de: 'In welchem Teil der App befindet sich der Fehler?',
    },
    answers: {
      1: {
        en: 'Main page (for example, a word or character is incorrectly displayed or incorrectly translated)',
        de: 'Startseite (Beispiel: ein Wort oder Zeichen wird fehlerhaft dargestellt oder übersetzt)',
      },
      2: {
        en: 'Sentence history page',
        de: 'Übersetzungschronik,',
      },
      3: {
        en: 'Reading room page',
        de: 'Lesesaal',
      },
      4: {
        en: 'A setting or menu',
        de: 'Einstellungen/Menü',
      },
    },

    main_page: {
      1: {
        en: 'This page displays segmented and translated sentence, and it is the first page a user sees when visiting mandobot.netlify.app',
        de: 'Diese Seite zeigt segmentierte und übersetze Sätze an, und ist die erste Seite die dem Nutzer beim Besuch von mandobot.netlify.app angezeigt wird',
      },
      2: {
        en: 'If the bug or problem happens when looking at a segmented/translated sentence, please open that sentence, then click on the share icon on the top-right corner of the page (pictured). It will show you a link. Please paste that link below.',
        de: 'Falls der Fehler bei der Ansicht von segmentierten/übersetzen Sätzen auftritt, öffnen Sie bitte den betroffenen Satz, und wählen das Teilen-Icon in der oberen rechten Ecke der Seite (dargestellt). Ihnen sollte nun ein Link angezeigt werden. Bitte fügen Sie diesen hier ein.',
      },
      share_button: {
        en: 'share button',
        de: 'Teilen-Icon',
      },
    },

    sentence_history: {
      1: {
        en: 'A catalogue of sentences that have been previously translated and segmented',
        de: 'Ein Katalog der Sätze, welche zuvor übersetzt und segmentiert wurden',
      },
      2: {
        en: 'Please give a brief description of the bug or problem.',
        de: 'Bitte liefern Sie eine kurze Beschreibung des auftretenden Fehlers.',
      },
    },

    reading_room: {
      1: {
        en: 'A list of texts that have been pre-segmented and translated, sorted by ability level',
        de: 'Eine Auswahl an Texten, welche bereits segmentiert und übersetzt zur Verfügung gestellt werden, nach Schwierigkeitsgrad sortiert',
      },
      2: {
        en: 'Please give a brief description of the bug or problem.',
        de: 'Bitte liefern Sie eine kurze Beschreibung des auftretenden Fehlers.',
      },
    },

    settings_and_menus: {
      1: {
        en: 'Any bugs related to settings and menus',
        de: 'Jegliche Fehler im Zusammenhang mit Einstellungen und Menüs',
      },
      2: {
        en: 'Please give a brief description of the bug or problem.',
        de: 'Bitte liefern Sie eine kurze Beschreibung des auftretenden Fehlers.',
      },
    },

    other: {
      1: {
        en: 'Other',
        de: 'Sonstiges',
      },
      2: {
        en: 'Any bug or problem that does not fit in one of the other categories',
        de: 'Jegliche Fehler, welche nicht in eine der anderen Kategorien passen',
      },
      3: {
        en: 'Please give a brief description of the bug or problem.',
        de: 'Bitte liefern Sie eine kurze Beschreibung des auftretenden Fehlers.',
      },
    },
  },
};
