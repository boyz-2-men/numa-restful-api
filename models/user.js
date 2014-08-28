'use strict';

var mongoose           = require('mongoose');
var Schema             = mongoose.Schema;
var bcrypt             = require('bcrypt-nodejs');
var timestamps         = require('mongoose-timestamp');
var SALT_WORK_FACTOR   = 10;
var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME          = 60 * 60 * 1000; // 1 hour lock (ms)

// schema ----------------------------------------------------------------------
var UserSchema = new Schema({

  github: String,

  displayName: String,

  local: {
    username: { type: String, trim: true, index: { unique: true } },
    email: { type: String, trim: true },
    password: { type: String }
  },

  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number }

});

UserSchema.virtual('isLocked').get(function() {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// plugins ---------------------------------------------------------------------
UserSchema.plugin(timestamps);

// methods ---------------------------------------------------------------------
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.local.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

UserSchema.methods.incLoginAttempts = function(cb) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, cb);
  }

  // otherwise we're incrementing
  var updates = { $inc: { loginAttempts: 1 } };

  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.update(updates, cb);
};

// Sanitize
// UserSchema.methods.toJSON = function() {
//   var user = this.toObject();
//   delete user._id;
//   delete user.__v;
//   delete user.local.email;
//   delete user.local.password;
//   delete user.updatedAt;
//   return user;
// };

// statics ---------------------------------------------------------------------
// Expose enum on the model, and provide an internal convenience reference
var reasons = UserSchema.statics.failedLogin = {
  NOT_FOUND          : 0,
  PASSWORD_INCORRECT : 1,
  MAX_ATTEMPTS       : 2
};

UserSchema.statics.getAuthenticated = function(username, password, cb) {


  this.findOne({
    'local.username': username
  }, function(err, user) {
    if (err) {
      return cb(err);
    }

    // make sure user exists
    if (!user) {
      return cb(null, null, reasons.NOT_FOUND);
    }

    // check if the account is currently locked
    if (user.isLocked) {
      // just increment login attempts if account is already locked
      return user.incLoginAttempts(function(err) {
        if (err) {
          return cb(err);
        }
        return cb(null, null, reasons.MAX_ATTEMPTS);
      });
    }

    // test for a matching password
    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        return cb(err);
      }

      // check if the password was a match
      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) {
          return cb(null, user);
        }

        // reset attempts and lock info
        var updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 }
        };
        return user.update(updates, function(err) {
          if (err) {
            return cb(err);
          }
          return cb(null, user);
        });
      }

      // password is incorrect, so increment login attempts before responding
      user.incLoginAttempts(function(err) {
        if (err) {
          return cb(err);
        }
        return cb(null, null, reasons.PASSWORD_INCORRECT);
      });
    });
  });
};

module.exports = mongoose.model('User', UserSchema);