const mongoose = require('mongoose')
const { Schema } = mongoose;

const issueSchema = new Schema({
  issue_title: {
    type: String,
  },
  issue_text: {
    type: String,
  },
  created_by: {
    type: String,
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
  },
},
{
  timestamps: {
    createdAt: 'created_on',
    updatedAt: 'updated_on',
  },
})

module.exports = issueSchema;
