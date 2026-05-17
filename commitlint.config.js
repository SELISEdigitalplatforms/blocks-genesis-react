export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['ui', 'hooks', 'docs', 'tooling', 'release', 'deps', 'cli'],
    ],
  },
}
