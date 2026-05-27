module.exports = {
  '*.html': ['html-validate --formatter codeframe', 'prettier --write'],
  '*.css': function (files) {
    return [
      'stylelint --fix ' + files.map(function (f) { return '"' + f + '"'; }).join(' '),
      'prettier --write ' + files.map(function (f) { return '"' + f + '"'; }).join(' '),
    ];
  },
  'js/**/*.js': ['eslint --fix', 'prettier --write'],
};
