'use strict';

const post = require('./post');

const YASPELLER_HOST = 'speller.yandex.net';
const YASPELLER_PATH = '/services/spellservice.json/';

/**
 * Check text for typos.
 *
 * @param {string} text
 * @param {Function} callback
 * @param {Settings} settings
 * @see {@link https://tech.yandex.ru/speller/doc/dg/reference/checkText-docpage/}
 */
function checkText(text, callback, settings) {
  const form = prepareSettings(settings);
  form.text = text;

  post({
      host: YASPELLER_HOST,
      path: YASPELLER_PATH + 'checkText',
      form: form,
    }, function(error, response, body) {
      if (error) {
        callback(error, null);
      } else {
        if (response.statusCode === 200) {
          callback(null, body);
        } else {
          callback(
            Error('Yandex.Speller API returns status code is ' +
              response.statusCode, null)
          );
        }
      }
    });
}

/**
 * Check text for typos.
 *
 * @param {string[]} texts
 * @param {Function} callback
 * @param {Settings} settings
 * @see {@link https://tech.yandex.ru/speller/doc/dg/reference/checkTexts-docpage/}
 */
function checkTexts(texts, callback, settings) {
  const form = prepareSettings(settings);
  form.text = texts;

  post({
      host: YASPELLER_HOST,
      path: YASPELLER_PATH + 'checkTexts',
      form: form,
    }, function(error, response, body) {
      if (error) {
        callback(error, null);
      } else {
        if (response.statusCode === 200) {
          callback(null, body);
        } else {
          callback(
            Error('Yandex.Speller API returns status code is ' +
              response.statusCode, null)
          );
        }
      }
    });
}

/**
 * @see {@link https://tech.yandex.ru/speller/doc/dg/reference/speller-options-docpage/}
 */
function prepareOptions(options) {
  let result = 0;
  const standartOptions = {
      IGNORE_UPPERCASE: 1,
      IGNORE_DIGITS: 2,
      IGNORE_URLS: 4,
      FIND_REPEAT_WORDS: 8,
      IGNORE_LATIN: 16,
      NO_SUGGEST: 32,
      FLAG_LATIN: 128,
      BY_WORDS: 256,
      IGNORE_CAPITALIZATION: 512,
      IGNORE_ROMAN_NUMERALS: 2048,
    };

  Object.keys(options || {}).forEach(function(key) {
      const upperCaseKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
      if (standartOptions[upperCaseKey] && options[key]) {
        result |= standartOptions[upperCaseKey];
      }
    });

  return result;
}

function prepareSettings(settings) {
  settings = settings || {};

  return {
      format: settings.format || 'plain',
      lang: settings.lang || 'en,ru',
      options: prepareOptions(settings.options),
      requestLimit: settings.requestLimit || 2,
      timeout: settings.timeout || 500
    };
}

/**
 * @typedef {Object} Settings
 * @param {string} [format] Text format: plain or html.
 * @param {string|Array} [lang] Language: en, ru or uk.
 * @param {number} [requestLimit] Request repeat count in case internet connection issues.
 * @param {number} [timeout] Timeout between request repeats in milliseconds.
 * @param {Object} [options]
 * @param {boolean} [options.ignoreUppercase] Ignore words written in capital letters.
 * @param {boolean} [options.ignoreDigits] Ignore words with numbers, such as "avp17h4534".
 * @param {boolean} [options.ignoreUrls] Ignore Internet addresses, email addresses and filenames.
 * @param {boolean} [options.findRepeatWords] Highlight repetitions of words, consecutive. For example, "I flew to to to Cyprus".
 * @param {boolean} [options.ignoreLatin] Ignore words, written in Latin, for example, "madrid".
 * @param {boolean} [options.noSuggest] Just check the text, without giving options to replace.
 * @param {boolean} [options.flagLatin] Celebrate words, written in Latin, as erroneous.
 * @param {boolean} [options.byWords] Do not use a dictionary environment (context) during the scan. This is useful in cases where the service is transmitted to the input of a list of individual words.
 * @param {boolean} [options.ignoreCapitalization] Ignore the incorrect use of UPPERCASE / lowercase letters, for example, in the word "moscow".
 * @param {boolean} [options.ignoreRomanNumerals] Ignore Roman numerals ("I, II, III, ...").
 */
module.exports = {
  checkText: checkText,
  checkTexts: checkTexts,
  /**
   *  @see {@link https://tech.yandex.ru/speller/doc/dg/reference/error-codes-docpage/}
   */
  errorCodes: [
    {
      name: 'ERROR_UNKNOWN_WORD',
      text: 'Typos',
      code: 1,
    },
    {
      name: 'ERROR_REPEAT_WORD',
      text: 'Repeat words',
      code: 2,
    },
    {
      name: 'ERROR_CAPITALIZATION',
      text: 'Capitalization',
      code: 3,
    },
    {
      name: 'ERROR_TOO_MANY_ERRORS',
      text: 'Too many errors',
      code: 4,
    }
  ]
};
