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

const updateIssue = async (issueBody, done) => {
  let issue = await Issue.findById(issueBody._id)
  for (let v in issueBody) {
    if (issueBody[v] !== '' && v !== '_id') {
      issue[v] = issueBody[v]
    }
  }
  issue.save( (err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

const getProjectIssues = async (project, done) => {
  let dbQuery = Issue.find({ project: project })
  dbQuery.exec((err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

module.exports = (app) => {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;
      let projectIssues = getProjectIssues(project, async (err, data) => {
        if (err) return console.log(err)
        res.json(data)
      })
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
          assigned_to: data._doc.assigned_to,
          status_text: data._doc.status_text,
          open: data._doc.open,
          _id: data._doc._id,
          issue_title: data._doc.issue_title,
          issue_text: data._doc.issue_text,
          created_by: data._doc.created_by,
          created_on: data._doc.created_on,
          updated_on: data._doc.updated_on,
        })
      })
    })

    .put(async (req, res) => {
      let project = req.params.project;
      let doc = await updateIssue(req.body, (err, data) => {
        if (err) return res.json({
          error: 'count not update',
          _id: req.body._id,
        })
        res.json({
          status: 'updated successfully',
          _id: req.body._id,
        })
      })
      // let issue = await Issue.findById(req.body._id)
      //
      // for (let v in req.body) {
      //   if (req.body[v] !== '' && v !== '_id') {
      //     issue[v] = req.body[v]
      //   }
      // }
      // issue.save( (err, data) => {
      //   if (err) return console.log(err)
      //   // done(null, data)
      // })
      // let issue = await findSingleIssue(req.body._id)
      // console.log(req.body)
      // let doc = updateIssue(req.body)
    })

    .delete(async (req, res) => {
      let project = req.params.project;

    });

};
