import {promisify} from 'util';
import lodash from 'lodash';
const {isPlainObject} = lodash;
import {esmImport} from './esm-import.js';
/**
 * Load `conventional-changelog-parser` options. Handle presets that return either a `Promise<Array>` or a `Promise<Function>`.
 *
 * @param {Object} pluginConfig The plugin configuration.
 * @param {Object} pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
 * @param {string} pluginConfig.config Requierable npm package with a custom conventional-changelog preset
 * @param {Object} pluginConfig.parserOpts Additionnal `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} pluginConfig.writerOpts Additionnal `conventional-changelog-writer` options that will overwrite ones loaded by `preset` or `config`.
 * @param {Object} context The semantic-release context.
 * @param {Array<Object>} context.commits The commits to analyze.
 * @param {String} context.cwd The current working directory.
 *
 * @return {Promise<Object>} a `Promise` that resolve to the `conventional-changelog-core` config.
 */
export default async ({preset, config, parserOpts, writerOpts, presetConfig}, {_}) => {
  let loadedConfig;

  if (preset) {
    const presetPackage = `conventional-changelog-${preset.toLowerCase()}`;
    loadedConfig = await esmImport(presetPackage);
  } else if (config) {
    loadedConfig = await esmImport(config);
  } else {
    loadedConfig = await esmImport('conventional-changelog-angular');
  }

  loadedConfig = await (typeof loadedConfig === 'function'
    ? isPlainObject(presetConfig)
      ? loadedConfig(presetConfig)
      : promisify(loadedConfig)()
    : loadedConfig);

  return {
    parserOpts: {...loadedConfig.parserOpts, ...parserOpts},
    writerOpts: {...loadedConfig.writerOpts, ...writerOpts},
  };
};
