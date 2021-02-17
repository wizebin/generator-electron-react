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

  const { install, main, use_asar_bool, github_action_publish } = await yo.optionOrPrompt([
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
    {
      type: 'confirm',
      name: 'github_action_publish',
      message: 'Include github publish script?',
      default: false
    },
  ]);

  yo.answers.install = install;
  yo.answers.use_asar_bool = use_asar_bool;
  yo.answers.github_action_publish = github_action_publish;
  yo.answers.main = main;

  if (github_action_publish) {
    const { bucket } = await yo.optionOrPrompt([
      {
        type: 'input',
        name: 'bucket',
        message: 'S3 bucket to publish to (remember to allow public ACLs on this bucket!)',
        default: yo.answers.name,
      },
    ]);

    yo.answers.bucket = bucket;
  }


  yo.context = { ...yo.context, ...yo.answers };
}
