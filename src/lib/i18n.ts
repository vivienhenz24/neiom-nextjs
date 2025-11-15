export type Locale = 'lb' | 'en'

// Import all translation files
import commonEn from '@/locales/en/common.json'
import commonLb from '@/locales/lb/common.json'
import homeEn from '@/locales/en/home.json'
import homeLb from '@/locales/lb/home.json'
import authEn from '@/locales/en/auth.json'
import authLb from '@/locales/lb/auth.json'
import errorsEn from '@/locales/en/errors.json'
import errorsLb from '@/locales/lb/errors.json'
import contactEn from '@/locales/en/contact.json'
import contactLb from '@/locales/lb/contact.json'
import pagesEn from '@/locales/en/pages.json'
import pagesLb from '@/locales/lb/pages.json'
import solutionsEn from '@/locales/en/solutions.json'
import solutionsLb from '@/locales/lb/solutions.json'

// Combine all translations for each locale
const translations = {
  en: {
    ...commonEn,
    ...homeEn,
    ...authEn,
    ...errorsEn,
    ...contactEn,
    // Flatten nested structures for easier access
    companyTitle: pagesEn.company.title,
    companySubtitle: pagesEn.company.subtitle,
    companyPageDesc: pagesEn.company.description,
    careersTitle: pagesEn.careers.title,
    careersSubtitle: pagesEn.careers.subtitle,
    careersPageDesc: pagesEn.careers.description,
    // Dialogue
    dialoguePlaceholder: pagesEn.dashboard.dialogue.placeholder,
    dialogueGeneratingAudio: pagesEn.dashboard.dialogue.generatingAudio,
    dialoguePlayAudio: pagesEn.dashboard.dialogue.playAudio,
    dialoguePauseAudio: pagesEn.dashboard.dialogue.pauseAudio,
    dialogueGenerateAudio: pagesEn.dashboard.dialogue.generateAudio,
    dialogueAudioOutOfSync: pagesEn.dashboard.dialogue.audioOutOfSync,
    dialogueUnableToGenerate: pagesEn.dashboard.dialogue.unableToGenerateDialogue,
    dialogueUnableToGenerateAudio: pagesEn.dashboard.dialogue.unableToGenerateAudio,
    dialogueAudioDataMissing: pagesEn.dashboard.dialogue.audioDataMissing,
    dialogueChatInputPlaceholder: pagesEn.dashboard.dialogue.chatInputPlaceholder,
    dialogueLanguageLabel: pagesEn.dashboard.dialogue.languageLabel,
    dialogueTurnCountLabel: pagesEn.dashboard.dialogue.turnCountLabel,
    dialogueTurns: pagesEn.dashboard.dialogue.turns,
    // Team
    teamTitle: pagesEn.team.title,
    teamSubtitle: pagesEn.team.subtitle,
    vivienRole: pagesEn.team.vivien.role,
    vivienName: pagesEn.team.vivien.name,
    vivienDescription: pagesEn.team.vivien.description,
    markRole: pagesEn.team.mark.role,
    markName: pagesEn.team.mark.name,
    markDescription: pagesEn.team.mark.description,
    // Mission
    missionTitle: pagesEn.mission.title,
    missionSubtitle: pagesEn.mission.subtitle,
    aboutNeiomSystems: pagesEn.mission.aboutNeiomSystems,
    missionDescription: pagesEn.mission.missionDescription,
    technologyDescription: pagesEn.mission.technologyDescription,
    impactDescription: pagesEn.mission.impactDescription,
    missionContent: pagesEn.mission.missionContent,
    technologyContent: pagesEn.mission.technologyContent,
    contactContent: pagesEn.mission.contactContent,
    // Solutions Extended
    euComplianceTitle: solutionsEn.accessibilityExtended.euComplianceTitle,
    euComplianceDescription: solutionsEn.accessibilityExtended.euComplianceDescription,
    euDirectiveLink: solutionsEn.accessibilityExtended.euDirectiveLink,
    euComplianceDescription2: solutionsEn.accessibilityExtended.euComplianceDescription2,
    underServedLanguages: solutionsEn.accessibilityExtended.underServedLanguages,
    keyBenefitsTitle: solutionsEn.accessibilityExtended.keyBenefitsTitle,
    benefit1: solutionsEn.accessibilityExtended.benefit1,
    benefit2: solutionsEn.accessibilityExtended.benefit2,
    benefit3: solutionsEn.accessibilityExtended.benefit3,
    benefit4: solutionsEn.accessibilityExtended.benefit4,
    announcementSolutions: solutionsEn.accessibilityExtended.announcementSolutions,
    advertisingSolutions: solutionsEn.accessibilityExtended.advertisingSolutions,
    callCenterSolutions: solutionsEn.accessibilityExtended.callCenterSolutions,
    transportation: solutionsEn.accessibilityExtended.transportation,
    transportationDesc: solutionsEn.accessibilityExtended.transportationDesc,
    retail: solutionsEn.accessibilityExtended.retail,
    retailDesc: solutionsEn.accessibilityExtended.retailDesc,
    healthcare: solutionsEn.accessibilityExtended.healthcare,
    healthcareDesc: solutionsEn.accessibilityExtended.healthcareDesc,
    education: solutionsEn.accessibilityExtended.education,
    educationDesc: solutionsEn.accessibilityExtended.educationDesc,
    radioAdvertising: solutionsEn.accessibilityExtended.radioAdvertising,
    radioAdvertisingDesc: solutionsEn.accessibilityExtended.radioAdvertisingDesc,
    socialMedia: solutionsEn.accessibilityExtended.socialMedia,
    socialMediaDesc: solutionsEn.accessibilityExtended.socialMediaDesc,
    productDemos: solutionsEn.accessibilityExtended.productDemos,
    productDemosDesc: solutionsEn.accessibilityExtended.productDemosDesc,
    customerSupport: solutionsEn.accessibilityExtended.customerSupport,
    customerSupportDesc: solutionsEn.accessibilityExtended.customerSupportDesc,
    orderProcessing: solutionsEn.accessibilityExtended.orderProcessing,
    orderProcessingDesc: solutionsEn.accessibilityExtended.orderProcessingDesc,
    appointmentScheduling: solutionsEn.accessibilityExtended.appointmentScheduling,
    appointmentSchedulingDesc: solutionsEn.accessibilityExtended.appointmentSchedulingDesc,
    technicalSupport: solutionsEn.accessibilityExtended.technicalSupport,
    technicalSupportDesc: solutionsEn.accessibilityExtended.technicalSupportDesc,
    salesInquiries: solutionsEn.accessibilityExtended.salesInquiries,
    salesInquiriesDesc: solutionsEn.accessibilityExtended.salesInquiriesDesc,
    // Solutions
    advertisements: solutionsEn.advertisements.title,
    advertisementsDesc: solutionsEn.advertisements.description,
    advertisementsPageDesc: solutionsEn.advertisements.pageDescription,
    accessibility: solutionsEn.accessibility.title,
    accessibilityDesc: solutionsEn.accessibility.description,
    accessibilityPageDesc: solutionsEn.accessibility.pageDescription,
    announcements: solutionsEn.announcements.title,
    announcementsDesc: solutionsEn.announcements.description,
    announcementsPageDesc: solutionsEn.announcements.pageDescription,
    callCenters: solutionsEn.callCenters.title,
    callCentersDesc: solutionsEn.callCenters.description,
    callCentersPageDesc: solutionsEn.callCenters.pageDescription,
  },
  lb: {
    ...commonLb,
    ...homeLb,
    ...authLb,
    ...errorsLb,
    ...contactLb,
    // Flatten nested structures for easier access
    companyTitle: pagesLb.company.title,
    companySubtitle: pagesLb.company.subtitle,
    companyPageDesc: pagesLb.company.description,
    careersTitle: pagesLb.careers.title,
    careersSubtitle: pagesLb.careers.subtitle,
    careersPageDesc: pagesLb.careers.description,
    // Dialogue
    dialoguePlaceholder: pagesLb.dashboard.dialogue.placeholder,
    dialogueGeneratingAudio: pagesLb.dashboard.dialogue.generatingAudio,
    dialoguePlayAudio: pagesLb.dashboard.dialogue.playAudio,
    dialoguePauseAudio: pagesLb.dashboard.dialogue.pauseAudio,
    dialogueGenerateAudio: pagesLb.dashboard.dialogue.generateAudio,
    dialogueAudioOutOfSync: pagesLb.dashboard.dialogue.audioOutOfSync,
    dialogueUnableToGenerate: pagesLb.dashboard.dialogue.unableToGenerateDialogue,
    dialogueUnableToGenerateAudio: pagesLb.dashboard.dialogue.unableToGenerateAudio,
    dialogueAudioDataMissing: pagesLb.dashboard.dialogue.audioDataMissing,
    dialogueChatInputPlaceholder: pagesLb.dashboard.dialogue.chatInputPlaceholder,
    dialogueLanguageLabel: pagesLb.dashboard.dialogue.languageLabel,
    dialogueTurnCountLabel: pagesLb.dashboard.dialogue.turnCountLabel,
    dialogueTurns: pagesLb.dashboard.dialogue.turns,
    // Team
    teamTitle: pagesLb.team.title,
    teamSubtitle: pagesLb.team.subtitle,
    vivienRole: pagesLb.team.vivien.role,
    vivienName: pagesLb.team.vivien.name,
    vivienDescription: pagesLb.team.vivien.description,
    markRole: pagesLb.team.mark.role,
    markName: pagesLb.team.mark.name,
    markDescription: pagesLb.team.mark.description,
    // Mission
    missionTitle: pagesLb.mission.title,
    missionSubtitle: pagesLb.mission.subtitle,
    aboutNeiomSystems: pagesLb.mission.aboutNeiomSystems,
    missionDescription: pagesLb.mission.missionDescription,
    technologyDescription: pagesLb.mission.technologyDescription,
    impactDescription: pagesLb.mission.impactDescription,
    missionContent: pagesLb.mission.missionContent,
    technologyContent: pagesLb.mission.technologyContent,
    contactContent: pagesLb.mission.contactContent,
    // Solutions Extended
    euComplianceTitle: solutionsLb.accessibilityExtended.euComplianceTitle,
    euComplianceDescription: solutionsLb.accessibilityExtended.euComplianceDescription,
    euDirectiveLink: solutionsLb.accessibilityExtended.euDirectiveLink,
    euComplianceDescription2: solutionsLb.accessibilityExtended.euComplianceDescription2,
    underServedLanguages: solutionsLb.accessibilityExtended.underServedLanguages,
    keyBenefitsTitle: solutionsLb.accessibilityExtended.keyBenefitsTitle,
    benefit1: solutionsLb.accessibilityExtended.benefit1,
    benefit2: solutionsLb.accessibilityExtended.benefit2,
    benefit3: solutionsLb.accessibilityExtended.benefit3,
    benefit4: solutionsLb.accessibilityExtended.benefit4,
    announcementSolutions: solutionsLb.accessibilityExtended.announcementSolutions,
    advertisingSolutions: solutionsLb.accessibilityExtended.advertisingSolutions,
    callCenterSolutions: solutionsLb.accessibilityExtended.callCenterSolutions,
    transportation: solutionsLb.accessibilityExtended.transportation,
    transportationDesc: solutionsLb.accessibilityExtended.transportationDesc,
    retail: solutionsLb.accessibilityExtended.retail,
    retailDesc: solutionsLb.accessibilityExtended.retailDesc,
    healthcare: solutionsLb.accessibilityExtended.healthcare,
    healthcareDesc: solutionsLb.accessibilityExtended.healthcareDesc,
    education: solutionsLb.accessibilityExtended.education,
    educationDesc: solutionsLb.accessibilityExtended.educationDesc,
    radioAdvertising: solutionsLb.accessibilityExtended.radioAdvertising,
    radioAdvertisingDesc: solutionsLb.accessibilityExtended.radioAdvertisingDesc,
    socialMedia: solutionsLb.accessibilityExtended.socialMedia,
    socialMediaDesc: solutionsLb.accessibilityExtended.socialMediaDesc,
    productDemos: solutionsLb.accessibilityExtended.productDemos,
    productDemosDesc: solutionsLb.accessibilityExtended.productDemosDesc,
    customerSupport: solutionsLb.accessibilityExtended.customerSupport,
    customerSupportDesc: solutionsLb.accessibilityExtended.customerSupportDesc,
    orderProcessing: solutionsLb.accessibilityExtended.orderProcessing,
    orderProcessingDesc: solutionsLb.accessibilityExtended.orderProcessingDesc,
    appointmentScheduling: solutionsLb.accessibilityExtended.appointmentScheduling,
    appointmentSchedulingDesc: solutionsLb.accessibilityExtended.appointmentSchedulingDesc,
    technicalSupport: solutionsLb.accessibilityExtended.technicalSupport,
    technicalSupportDesc: solutionsLb.accessibilityExtended.technicalSupportDesc,
    salesInquiries: solutionsLb.accessibilityExtended.salesInquiries,
    salesInquiriesDesc: solutionsLb.accessibilityExtended.salesInquiriesDesc,
    // Solutions
    advertisements: solutionsLb.advertisements.title,
    advertisementsDesc: solutionsLb.advertisements.description,
    advertisementsPageDesc: solutionsLb.advertisements.pageDescription,
    accessibility: solutionsLb.accessibility.title,
    accessibilityDesc: solutionsLb.accessibility.description,
    accessibilityPageDesc: solutionsLb.accessibility.pageDescription,
    announcements: solutionsLb.announcements.title,
    announcementsDesc: solutionsLb.announcements.description,
    announcementsPageDesc: solutionsLb.announcements.pageDescription,
    callCenters: solutionsLb.callCenters.title,
    callCentersDesc: solutionsLb.callCenters.description,
    callCentersPageDesc: solutionsLb.callCenters.pageDescription,
  }
} as const

export type TranslationKeys = keyof typeof translations.en

export function getTranslations(locale: Locale) {
  return translations[locale]
}

// Helper function to get nested translations
export function getNestedTranslations(locale: Locale) {
  return {
    common: locale === 'en' ? commonEn : commonLb,
    home: locale === 'en' ? homeEn : homeLb,
    auth: locale === 'en' ? authEn : authLb,
    errors: locale === 'en' ? errorsEn : errorsLb,
    contact: locale === 'en' ? contactEn : contactLb,
    pages: locale === 'en' ? pagesEn : pagesLb,
    solutions: locale === 'en' ? solutionsEn : solutionsLb,
  }
}

