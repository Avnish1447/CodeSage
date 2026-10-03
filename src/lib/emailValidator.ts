/**
 * CodeSage Email Authentication Validator
 *
 * Enforces reputable email domains (Google, Microsoft, Proton, Apple, Yahoo, etc.)
 * and verified institutional / corporate domains, while strictly blocking all
 * temporary, burner, and disposable email providers.
 */

// Renowned, high-reputation email providers
export const RENOWNED_EMAIL_PROVIDERS = new Set<string>([
  // Google
  'gmail.com',
  'googlemail.com',
  // Microsoft
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'windowslive.com',
  'passport.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'hotmail.es',
  'hotmail.it',
  'outlook.co.uk',
  'outlook.fr',
  'outlook.de',
  'outlook.in',
  'outlook.es',
  'outlook.jp',
  // Proton
  'proton.me',
  'protonmail.com',
  'pm.me',
  'protonmail.ch',
  // Apple
  'icloud.com',
  'me.com',
  'mac.com',
  // Yahoo
  'yahoo.com',
  'ymail.com',
  'myyahoo.com',
  'rocketmail.com',
  'yahoo.co.uk',
  'yahoo.co.in',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.es',
  'yahoo.ca',
  'yahoo.com.au',
  'yahoo.com.br',
  // Fastmail
  'fastmail.com',
  'fastmail.fm',
  'messagingengine.com',
  // Zoho
  'zoho.com',
  'zohomail.com',
  // Hey
  'hey.com',
  // Tuta (formerly Tutanota)
  'tuta.com',
  'tuta.io',
  'tutanota.com',
  'tutanota.de',
  // AOL
  'aol.com',
  'aim.com',
  // European & International Providers
  'gmx.com',
  'gmx.net',
  'gmx.de',
  'web.de',
  'mail.com',
  'orange.fr',
  'wanadoo.fr',
  'free.fr',
  'sfr.fr',
  'laposte.net',
  'libero.it',
  'virgilio.it',
  't-online.de',
  'freenet.de',
  'yandex.com',
  'yandex.ru',
  'naver.com',
  'daum.net',
  'kakao.com',
]);

// Known disposable, burner, and temporary email domains
export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'temp-mail.ru',
  'temp-mail.de',
  'temp-mails.com',
  'tempmailo.com',
  'tempmail.net',
  'tempmail.plus',
  'tempmail.ninja',
  'tempmailaddress.com',
  'tempmailgen.com',
  'tempmailer.com',
  'tempmailer.net',
  'temp-mail.club',
  'tempm.com',
  'tempmx.com',
  'tempail.com',
  'tempinbox.com',
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '10minutemail.co.uk',
  '10minutemail.be',
  '10minutemailbox.com',
  'minutemailbox.com',
  'minuteinbox.com',
  '20minutemail.com',
  '20minutemail.it',
  '30minutemail.com',
  '60minutemail.com',
  'mailinator.com',
  'mailinator2.com',
  'mailinator.net',
  'mailin8r.com',
  'binkmail.com',
  'safetymail.info',
  'suremail.info',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'trashmail.org',
  'trashmail.de',
  'trash-mail.com',
  'trashymail.com',
  'trashcanmail.com',
  'rcpt.at',
  'damnthespam.com',
  'throwawaymail.com',
  'throwaway.email',
  'dispostable.com',
  'disposablemail.com',
  'disposable.com',
  'getairmail.com',
  'airmail.cc',
  'mohmal.com',
  'mohmal.im',
  'mohmal.in',
  'mohmal.tech',
  'crazymailing.com',
  'crazymail.com',
  'fakemailgenerator.com',
  'fakeinbox.com',
  'emailfake.com',
  'fake-mail.com',
  'fakemail.net',
  'fakemail.io',
  'fakemail.cc',
  'emailondeck.com',
  'burnermail.io',
  'burnermail.com',
  'generator.email',
  'generator-email.com',
  'mytemp.email',
  'mytempemail.com',
  'mytempemail.net',
  'mytempmail.com',
  'inboxkitten.com',
  'inboxbear.com',
  'dropmail.me',
  'getnada.com',
  'nada.ltd',
  'nada.email',
  'abcvg.com',
  'maildrop.cc',
  'harakirimail.com',
  'meltmail.com',
  'tmailor.com',
  'tmail.ws',
  'tmpmail.org',
  'tmpmail.net',
  'spambox.us',
  'spambox.info',
  'zillamail.com',
  'tempemail.co',
  'anonymbox.com',
  'incognitomail.org',
  'mailexpire.com',
  'deadaddress.com',
  'mailcatch.com',
  'e4ward.com',
  'sneakemail.com',
  'mintemail.com',
  'emailthe.net',
  'mailnesia.com',
  'emailmiser.com',
  'byom.de',
  'discard.email',
  'discardmail.com',
  'discardmail.de',
  'spamex.com',
  'spambog.com',
  'spambog.de',
  'spambog.ru',
  'instantemailaddress.com',
  'instant-mail.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'vomoto.com',
  'marmotamail.com',
  'chacuo.net',
  'bugmenot.com',
  'nowmymail.com',
  'spam4.me',
  'boun.cr',
  'kasmail.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'spamgourmet.com',
  'mailpoof.com',
  'mailforspam.com',
  'mailnull.com',
  'onetimemail.com',
]);

// Keyword heuristics to detect dynamically generated or unlisted burner domains
export const DISPOSABLE_PATTERNS: RegExp[] = [
  /temp.*mail/i,
  /mail.*temp/i,
  /10.*minute/i,
  /20.*minute/i,
  /minute.*inbox/i,
  /minute.*mail/i,
  /throw.*away.*mail/i,
  /throw.*away.*email/i,
  /trash.*mail/i,
  /trash.*box/i,
  /fake.*mail/i,
  /fake.*inbox/i,
  /dispos.*mail/i,
  /dispos.*email/i,
  /dispostable/i,
  /burner.*mail/i,
  /guerrilla.*mail/i,
  /mailinator/i,
  /yopmail/i,
  /sharklasers/i,
  /dropmail/i,
  /getnada/i,
  /inboxkitten/i,
  /crazymailing/i,
  /generator.*email/i,
  /email.*generator/i,
  /email.*ondeck/i,
  /tempinbox/i,
  /maildrop/i,
  /harakirimail/i,
  /meltmail/i,
  /spambox/i,
  /wegwerfmail/i,
  /spamgourmet/i,
  /mailnesia/i,
  /discard.*email/i,
  /discard.*mail/i,
  /dead.*address/i,
  /incognito.*mail/i,
  /mohmal/i,
  /nada\.ltd/i,
  /nada\.email/i,
  /mytrashmail/i,
  /spamfree24/i,
  /binkmail/i,
  /mailexpire/i,
  /trashymail/i,
];

export interface EmailValidationResult {
  isValid: boolean;
  normalizedEmail: string;
  domain: string;
  category: 'renowned' | 'institutional' | 'corporate' | 'disposable' | 'invalid';
  error?: string;
}

/**
 * Validates an email address against strict anti-disposable rules.
 * Accepts renowned providers (Google, Microsoft, Proton, Apple, Yahoo, etc.)
 * as well as verified educational, governmental, and legitimate custom company domains.
 */
export function validateEmailForAuth(rawEmail: string): EmailValidationResult {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      isValid: false,
      normalizedEmail: '',
      domain: '',
      category: 'invalid',
      error: 'Please enter a valid email address.',
    };
  }

  const trimmed = rawEmail.trim().toLowerCase();

  // Basic RFC 5322 sanity check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+)$/;
  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      domain: '',
      category: 'invalid',
      error: 'Please enter a valid email address format (e.g., name@gmail.com).',
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      domain: '',
      category: 'invalid',
      error: 'Please enter a valid email address.',
    };
  }

  const [localPart, domain] = parts;

  // Local part validation
  if (!localPart || localPart.length > 64 || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      domain,
      category: 'invalid',
      error: 'The email username format is invalid.',
    };
  }

  // Domain structure validation
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      domain,
      category: 'invalid',
      error: 'The email domain format is invalid.',
    };
  }

  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      domain,
      category: 'invalid',
      error: 'The email domain has an invalid top-level domain.',
    };
  }

  // 1. Check explicit disposable blocklist
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      domain,
      category: 'disposable',
      error: 'Temporary or disposable email addresses are not permitted. Please use a trusted provider (Google, Microsoft, Proton, Apple, Yahoo) or your official work / university email.',
    };
  }

  // 2. Check disposable heuristic patterns
  for (const pattern of DISPOSABLE_PATTERNS) {
    if (pattern.test(domain)) {
      return {
        isValid: false,
        normalizedEmail: trimmed,
        domain,
        category: 'disposable',
        error: 'Temporary or disposable email addresses are not permitted. Please use a trusted provider (Google, Microsoft, Proton, Apple, Yahoo) or your official work / university email.',
      };
    }
  }

  // 3. Renowned public email providers (Google, Microsoft, Proton, Apple, Yahoo, Fastmail, Zoho, etc.)
  if (RENOWNED_EMAIL_PROVIDERS.has(domain)) {
    return {
      isValid: true,
      normalizedEmail: trimmed,
      domain,
      category: 'renowned',
    };
  }

  // 4. Institutional domains (Higher education, government, research institutions)
  const isEdu = domain.endsWith('.edu') ||
    domain.includes('.edu.') ||
    domain.endsWith('.ac.uk') ||
    domain.endsWith('.ac.in') ||
    domain.endsWith('.ac.jp') ||
    domain.endsWith('.ac.kr') ||
    domain.endsWith('.ac.nz') ||
    domain.endsWith('.ac.za') ||
    domain.endsWith('.gov') ||
    domain.includes('.gov.') ||
    domain.endsWith('.mil');

  if (isEdu) {
    return {
      isValid: true,
      normalizedEmail: trimmed,
      domain,
      category: 'institutional',
    };
  }

  // 5. Verified custom corporate / company domains
  // Disallow suspicious short domains or numeric subdomains often used in automated abuse
  if (domainParts[0].length < 2 && domainParts.length === 2) {
    return {
      isValid: false,
      normalizedEmail: trimmed,
      domain,
      category: 'invalid',
      error: 'The domain name is too short to be a recognized email provider.',
    };
  }

  return {
    isValid: true,
    normalizedEmail: trimmed,
    domain,
    category: 'corporate',
  };
}
