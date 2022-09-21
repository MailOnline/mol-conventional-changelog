const fs = require('fs');
const inquirer = require('inquirer');
const wrap = require('word-wrap');
const appRoot = require('app-root-path');
const {
  createPackagesQuestion,
  createQuestions
} = require('./questions');
const LimitedInput = require('./LimitedInput');
const {
  getAllPackages,
  getChangedPackages
} = require('./lernaUtils');

const MAX_LINE_WIDTH = 72;

inquirer.registerPrompt('limitedInput', LimitedInput);

const IS_LERNA_PROJECT = fs.existsSync(appRoot.resolve('lerna.json'));

const makeAffectsLine = function (answers) {
  const selectedPackages = answers.packages;

  if (selectedPackages && selectedPackages.length) {
    return `\naffects: ${selectedPackages.join(', ')}`;
  }

  return '';
};

const returnPrompt = (config, promptQuestions, commit) =>
  inquirer.prompt(promptQuestions)
    .then((answers) => {
      const wrapOptions = {
        indent: '',
        trim: true,
        width: MAX_LINE_WIDTH
      };

      const emoji = config.types[answers.type].emoji;
      const emojiPrefix = emoji ? emoji + ' ' : '';
      const head = answers.type + ': ' + emojiPrefix + answers.subject;
      const affectsLine = makeAffectsLine(answers);

      // Wrap these lines at MAX_LINE_WIDTH character
      const body = wrap(answers.body + affectsLine, wrapOptions);
      const breaking = wrap(answers.breaking, wrapOptions);
      const footer = wrap(answers.footer, wrapOptions);

      let msg;

      msg = head;

      if (body) {
        msg += '\n\n' + body;
      }

      if (breaking) {
        msg += '\n\nBREAKING CHANGE: ' + breaking;
      }

      if (footer) {
        msg += '\n\nIssues: ' + footer;
      }

      return commit(msg);
    });

module.exports = (config) => {
  const prompter = {
    // Will not accept async function
    prompter (cz, commit) {
      let promptQuestions = createQuestions(config);

      if (IS_LERNA_PROJECT) {
        return getAllPackages().then((allPackagesPromise) => {
          const allPackages = allPackagesPromise.map((pkg) => pkg.name);

          return getChangedPackages().then((changedPackages) => {
            promptQuestions = promptQuestions.concat(createPackagesQuestion(allPackages, changedPackages));

            return returnPrompt(config, promptQuestions, commit);
          });
        });
      }

      return returnPrompt(config, promptQuestions, commit);
    }
  };

  return prompter;
};
