var gulp = require('gulp'),
    inquirer = require("inquirer"), 
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tag_version = require('gulp-tag-version');
 
var requested = {};

gulp.task('ask', function (cb) {
    inquirer.prompt([{
      type: "list",
      message: "What kind of release would you like to do?",
      name: "type",
      choices: ['patch', 'minor', 'major', 'custom']
    }, {
      type: "input",
      name: "version",
      message: "What version number then?",
      when: function (answers) {
        return answers.type && answers.type == 'custom';
      },
      validate: function( value ) {
        var pass = value.match(/v?\d+\.\d+\.\d+(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?/ig);
        return pass ? true : "Please enter a valid version number";
      }
    }], function(answers) {
      if (answers.version) {
        requested = { version: answers.version };
      } else {
        requested = { type: answers.type };
      }

      cb();
    });
});

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * Use command:
 *
 *     gulp release
 *
 * To be prompted to give a version number to bump to 
 *
 *     patch           # makes 0.1.0 → 0.1.1
 *     minor           # makes 0.1.1 → 0.2.0
 *     major           # makes 0.2.1 → 1.0.0
 *     custom x.x.x    # makes x.x.x → x.x.x
 *
 * Pushing a Tag will trigger Travis CI to release to NPM
 */
gulp.task('release', ['ask'], function () { 
  return gulp.src(['./package.json'])
      // bump the version number
      .pipe(bump(requested))
      // save it back to filesystem 
      .pipe(gulp.dest('./'))
      // commit the changed version number 
      .pipe(git.commit('Bumps package version'))
      // read only one file to get the version number 
      .pipe(filter('package.json'))
      // **tag it in the repository** 
      .pipe(tag_version());
})
