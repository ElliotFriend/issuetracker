const mongoose = require('mongoose')
const { Schema } = mongoose;

const issueSchema = new Schema({
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
    required: true,
  },
  assigned_to: {
    type: String,
  },
  open: {
    type: Boolean,
    default: true,
  },
  status_text: {
    type: String,
  },
  project: {
    type: String,
    required: true,
  },
},
{
  timestamps: {
    createdAt: 'created_on',
    updatedAt: 'updated_on',
  },
})

module.exports = issueSchema;
