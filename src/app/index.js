import Generator from 'yeoman-generator';
import yoOptionOrPrompt from 'yo-option-or-prompt';
import prompting from './prompting';
import fs from 'fs-extra';

export default class Gen extends Generator {
  initializing() {
    this.optionOrPrompt = yoOptionOrPrompt;
    this.context = {};
  }

  prompting() {
    return prompting(this);
  }

  configuring() {
    this.destinationRoot(this.answers.destination);
  }

  async writing() {
    this.fs.copyTpl(
      this.templatePath('rootTemplated'),
      this.destinationPath(),
      this.context,
      {},
      { globOptions: {dot: true} }
    );
    await fs.copy(
      this.templatePath('rootNonTemplated'),
      this.destinationPath(),
      { globOptions: {dot: true} },
    );
    // this.directory(this.templatePath(), './');
  }

  conflicts() {
    return this;
  }

  install() {
    const installChar = this.options.install
      ? this.options.install[0].toLowerCase()
      : 'y';
    if (!this.answers.install || installChar === 'n' || installChar === 'f') {
      return false;
    }

    return this.installDependencies({
      bower: false,
    });
  }

  end() {
    return this;
  }
}
