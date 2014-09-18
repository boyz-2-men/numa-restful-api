'use strict';

var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var User       = require('./user.js');
var Comment    = require('./comment.js');
var Tag        = require('./tag.js');
var Schema     = mongoose.Schema;

// schema ----------------------------------------------------------------------
var poemSchema = new Schema({
  creator     : { type: Schema.Types.ObjectId, ref: 'User' },
  title       : { type: String },
  poem        : { type: String },
  tags        : [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  comments    : [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  upvotes     : { type: Number },
  downvotes   : { type: Number },
  inspiration : { type: String }
});

// plugins ---------------------------------------------------------------------
poemSchema.plugin(timestamps);

module.exports = mongoose.model('Poem', poemSchema);