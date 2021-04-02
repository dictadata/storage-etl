/**
 * etl/tracts
 */
"use strict";

const { StorageError } = require("@dictadata/storage-junctions").types;
const { typeOf, logger } = require("@dictadata/storage-junctions").utils;

const Package = require('../../package.json');
const fs = require('fs');

exports.version = Package.version;

var defaults = {
  "_log": {
    logPath: "./log",
    logPrefix: "etl",
    logLevel: "info"
  }
};

/**
 *
 */
exports.createTracts = async function (tractsFilename) {

  try {
    let sampleTracts = {
      "tract-name": {
        "origin": {
          "smt": "csv|./|foofile.csv|*",
          "options": {
            "header": true,
            "encoding": {}
          }
        },
        "transforms": {
          "filter": {},
          "select": {}
        },
        "terminal": {
          "smt": "json|./|foofile.json|*",
          "options": {
            "encoding": {},
            "noCreate": false
          }
        }
      },
      "_plugins": {
        "filesystems": {
          "package_name": ["prefix"]
        },
        "junctions": {
          "package_name": ["model"]
        }
      },
      "_log": {
        "logPath": "./log",
        "logPrefix": "etl",
        "logLevel": "info"
      }
    };

    logger.info("writing sample tracts configuration to " + tractsFilename);
    await fs.writeFileSync(tractsFilename, JSON.stringify(sampleTracts, null, " "), { encodign: 'utf-8', flag: 'wx' });
  }
  catch (err) {
    logger.warn(err.message);
  }

};

/**
 *
 */
exports.loadTracts = async (tractsFilename, schema) => {
  let tracts;

  try {
    // read the app configuration file
    let text = await fs.readFileSync(tractsFilename, 'utf-8');
    if (schema)
      text = text.replace(/\${schema}/g, schema);
    let appConfig = JSON.parse(text);
    tracts = Object.assign({}, defaults, appConfig);

    logger.configETLLogger(tracts._log);

    // check tract properties
    for (let [name, tract] of Object.entries(tracts)) {
      if (name === "_log") continue;
      if (name === "_plugins") {
        loadPlugins(tracts["_plugins"]);
        continue;
      }

      if (typeof tract === "function")
        continue;
      // check origin properties
      if (typeOf(tract.origin) !== "object")
        throw new StorageError(400, "invalid tract origin: " + name);
      if (typeOf(tract.terminal) !== "object")
        throw new StorageError(400, "invalid tract terminal: " + name);
    }

  }
  catch (err) {
    logger.error(err.message);
  }

  return tracts;
};

async function loadPlugins(plugins) {

  // register filesystem plugins
  for (let [name, prefixes] of Object.entries(plugins["filesystems"])) {
    let stfs = require(name);
    for (let prefix of prefixes)
      storage.FileSystems.use(prefix, stfs);
  }

  // register junction plugins
  for (let [name, models] of Object.entries(plugins["junctions"])) {
    let junction = require(name);
    for (let model of models)
      storage.use(model, junction);
  }

}