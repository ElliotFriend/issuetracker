'use strict';

const mongoose          = require('mongoose')
const issueSchema       = require('../issueSchema');
let Issue = mongoose.model('Issue', issueSchema)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const createIssue = async (issueBody, done) => {
  let issue = new Issue({
    ...issueBody
  })
  issue.save( (err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      let project = req.params.project;

    })

    .post(async (req, res) => {
      let project = req.params.project;
      console.log(req.body)
      let doc = await createIssue({
        ...req.body,
        project: project,
      }, (err, data) => {
        if (err) return console.log(err)
        res.json({
          ...data._doc
        })
      })
    })

    .put(function (req, res){
      let project = req.params.project;

    })

    .delete(function (req, res){
      let project = req.params.project;

    });

};
