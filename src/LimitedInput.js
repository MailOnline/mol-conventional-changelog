const inquirer = require('inquirer');

class LimitedInput extends inquirer.prompt.prompts.input {
  constructor (...args) {
    super(...args);

    if (!this.opt.maxLength) {
      this.throwParamError('maxLength');
    }
    this.originalMessage = this.opt.message;
    this.spacer = new Array(this.opt.maxLength).fill('-').join('');

    if (this.opt.leadingLabel) {
      if (typeof this.opt.leadingLabel === 'function') {
        this.leadingLabel = ' ' + this.opt.leadingLabel(this.answers);
      } else {
        this.leadingLabel = ' ' + this.opt.leadingLabel;
      }
    } else {
      this.leadingLabel = '';
    }

    this.leadingLength = this.leadingLabel.length;
    this.updateMessage();
  }

  updateMessage () {
    this.opt.message = `${this.originalMessage}
    [${this.spacer}] ${this.remainingChar()} remaining chars
    ${this.leadingLabel}`;
  }

  remainingChar () {
    return this.opt.maxLength - this.leadingLength - this.rl.line.length;
  }

  onKeypress () {
    if (this.rl.line.length > this.opt.maxLength - this.leadingLength) {
      this.rl.line = this.rl.line.slice(0, this.opt.maxLength - this.leadingLength);
      this.rl.cursor--;
    }

    this.updateMessage();
    this.render();
  }
}

module.exports = LimitedInput;
