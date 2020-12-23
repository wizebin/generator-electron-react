import YoBasePrompts from 'yo-base-prompts';

export default async function prompting(yo) {
  const yoBasePrompts = new YoBasePrompts(yo);
  yo.answers = await yoBasePrompts.prompt({
    authorEmail: true,
    authorName: true,
    authorUrl: true,
    description: true,
    destination: true,
    githubUsername: true,
    homepage: true,
    license: true,
    name: true,
    repository: true,
    version: true
  });

  const { install, main, use_asar_bool } = await yo.optionOrPrompt([
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies',
      default: true
    },
    {
      type: 'confirm',
      name: 'use_asar_bool',
      message: 'Use ASAR? (kinda sucks)',
      default: false
    },
  ]);
  yo.answers.install = install;
  yo.answers.use_asar_bool = use_asar_bool;
  yo.answers.main = main;

  yo.context = { ...yo.context, ...yo.answers };
}
