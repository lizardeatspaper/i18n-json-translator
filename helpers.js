const fs = require('fs')

function zipObject(keys = [], values = []) {
  return keys.reduce((acc, key, index) => {
    return { ...acc, [key]: values[index] }
  }, Object.create(null))
}

function recursiveObjectPromiseAll(obj) {
  const keys = Object.keys(obj)
  return Promise
    .all(
      keys.map(key => {
        const value = obj[key]
        if (typeof value === 'object' && !value.then) {
          return recursiveObjectPromiseAll(value)
        }
        return value
      })
    )
    .then(result => zipObject(keys, result))
}

function loadJsonFromFile(filename) {
  return new Promise((resolve, reject) => {
    return fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err)
      }

      try {
        resolve(data.toString())
      } catch (err) {
        reject(err)
      }
    })
  })
}

function writeJsonToFile(json, filename) {
  return new Promise((resolve, reject) => {
    return fs.writeFile(filename, json, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

module.exports = {
  zipObject,
  writeJsonToFile,
  loadJsonFromFile,
  recursiveObjectPromiseAll
}
