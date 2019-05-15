'use strict'

const { recursiveObjectPromiseAll } = require('./helpers')

module.exports = function ({ googleApiKey }) {
  const google = require('google-translate')(googleApiKey)

  /**
   * Translate i18n JSON.
   *
   * @param {String} json
   *    A valid JSON string.
   * @param {Object} config
   * @param {String} config.toLanguage
   *    Target language.
   * @param {String} config.prevVersion
   *    If specified, the previously translated values will not be overwritten.
   * @param {Number} config.indent
   *    Number of spaces used for indentation in the result JSON.
   * @returns {Promise<String>}
   */
  function translate(json, { toLanguage, prevVersion, indent = 2 } = {}) {
    if (typeof json !== 'string') {
      throw new TypeError('Invalid parameter `json`. Must be a valid JSON string.')
    }

    const parsed = JSON.parse(json)

    prevVersion = typeof prevVersion === 'string'
      ? JSON.parse(prevVersion)
      : null

    let promise
    if (Array.isArray(parsed)) {
      promise = translateArray(parsed, { toLanguage, prevVersion })
    } else if (typeof parsed === 'object' && parsed != null) {
      promise = translateObject(parsed, { toLanguage, prevVersion })
    } else {
      throw new TypeError('Invalid parameter `json`. Must be a valid JSON string.')
    }

    return promise
      .then((result) => {
        return JSON.stringify(result, null, indent)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  function translateArray(array, { toLanguage, prevVersion }) {
    return Promise.all(
      array.map((item, index) => {
        const prevValue = prevVersion && prevVersion[index]
        if (Array.isArray(item)) {
          return translateArray(item, { toLanguage, prevVersion: prevValue })
        } else if (typeof item === 'object' && item != null) {
          return translateObject(item, { toLanguage, prevVersion: prevValue })
        } else if (typeof item === 'string') {
          return translateString(item, { toLanguage, prevVersion: prevValue })
        } else {
          return Promise.resolve(item)
        }
      })
    )
  }

  function translateObject(object, { toLanguage, prevVersion }) {
    return recursiveObjectPromiseAll(
      Object.keys(object).reduce((acc, key) => {
        const prevValue = prevVersion && prevVersion[key]
        if (Array.isArray(object[key])) {
          acc[key] = translateArray(object[key], { toLanguage, prevVersion: prevValue })
        } else if (typeof object[key] === 'object' && object[key] != null) {
          acc[key] = translateObject(object[key], { toLanguage, prevVersion: prevValue })
        } else if (typeof object[key] === 'string') {
          acc[key] = translateString(object[key], { toLanguage, prevVersion: prevValue })
        } else {
          acc[key] = Promise.resolve(object[key])
        }
        return acc
      }, Object.create(null))
    )
  }

  function translateString(string, { toLanguage, prevVersion }) {
    return new Promise((resolve, reject) => {
      if (typeof prevVersion === 'string') {
        return resolve(prevVersion)
      }
      return google.translate(string, toLanguage, (err, translation) => {
        if (err) {
          reject(err)
        } else {
          resolve(translation.translatedText)
        }
      })
    })
  }

  return {
    translate
  }
}
