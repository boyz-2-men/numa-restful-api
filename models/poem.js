'use strict';

var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var voting     = require('mongoose-voting');
var User       = require('./user.js');
var Comment    = require('./comment.js');
var Schema     = mongoose.Schema;

// schema ----------------------------------------------------------------------
var poemSchema = new Schema({
  creator     : { type: Schema.Types.ObjectId, ref: 'User' },
  title       : { type: String },
  poem        : { type: String },
  tags        : [{ type: String, trim: true }],
  comments    : [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  inspiration : { type: String }
});

// plugins ---------------------------------------------------------------------
poemSchema.plugin(timestamps);
poemSchema.plugin(voting);

module.exports = mongoose.model('Poem', poemSchema);