'use strict';

var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var voting     = require('mongoose-voting');
var paginate   = require('mongoose-paginate');
var User       = require('./user.js');
var Comment    = require('./comment.js');
var Schema     = mongoose.Schema;

// schema ----------------------------------------------------------------------
var poemSchema = new Schema({
  creator      : { type: Schema.Types.ObjectId, ref: 'User' },
  title        : { type: String },
  poem         : { type: String },
  tags         : [{ type: String, trim: true }],
  comments     : [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  inspirations : {
    text     : { type: String },
    imageUrl : { type: String },
    // song     : { title: { type: String }, artist: { type: String }, url: { type: String }},
    videoUrl : { type: String }
  }
});

// plugins ---------------------------------------------------------------------
poemSchema.plugin(timestamps);
poemSchema.plugin(voting);
poemSchema.plugin(paginate);

module.exports = mongoose.model('Poem', poemSchema);