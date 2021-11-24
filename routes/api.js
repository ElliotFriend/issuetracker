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

const getProjectIssues = async (project, query, done) => {
  let dbFilter = { project: project, }
  if (query) {
    for (let v in query) {
      dbFilter[v] = query[v]
    }
  }
  let dbQuery = Issue.find(dbFilter)
    .select({ project: 0, __v: 0})
  dbQuery.exec((err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

const updateIssue = async (issueBody, done) => {
  let issue = Issue.findById(issueBody._id)
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

const deleteIssue = async (id, done) => {
  let doc = Issue.findOneAndDelete({_id: id}, (err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

module.exports = (app) => {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;
      let projectIssues = getProjectIssues(project, req.query, async (err, data) => {
        if (err) return console.log(err)
        res.json(data)
      })
    })

    .post(async (req, res) => {
      let project = req.params.project;
      if (req.body.issue_title === '' || req.body.issue_text === '' || req.body.created_by === '') {
        return res.json({
          error: 'required field(s) missing',
        })
      }
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
      if (!req.body._id) return res.json({
        error: 'missing _id',
      })
      let doc = await updateIssue(req.body, (err, data) => {
        if (err) return res.json({
          error: 'count not update',
          _id: req.body._id,
        })
        res.json({
          result: 'successfully updated',
          _id: req.body._id,
        })
      })
    })

    .delete(async (req, res) => {
      let project = req.params.project;
      if (!req.body._id) return res.json({
        error: 'missing _id',
      })
      let doc = await deleteIssue(req.body._id, (err, data) => {
        if (err) return res.json({
          error: 'could not delete',
          _id: req.body._id,
        })
        res.json({
          result: 'successfully deleted',
          _id: req.body._id,
        })
      })
    });

};
