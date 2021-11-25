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
  let update = {}
  for (let v in issueBody) {
    if (issueBody[v] !== '' && v !== '_id') {
      update[v] = issueBody[v]
    }
  }
  let issue = Issue.findByIdAndUpdate(issueBody._id, update, (err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
  // issue.save( (err, data) => {
  //   if (err) return console.log(err)
  //   done(null, data)
  // })
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
      // console.log(req.body)
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({
          error: 'required field(s) missing',
        })
      }
      let doc = await createIssue({
        ...req.body,
        project: project,
      }, (err, data) => {
        if (err) return console.log(err)
        // console.log(data)
        res.json({
          assigned_to: data.assigned_to,
          status_text: data.status_text,
          open: data.open,
          _id: data._id,
          issue_title: data.issue_title,
          issue_text: data.issue_text,
          created_by: data.created_by,
          created_on: data.created_on,
          updated_on: data.updated_on,
        })
      })
    })

    .put(async (req, res) => {
      let project = req.params.project;
      // console.log(req.body)
      if (!req.body._id) return res.json({
        error: 'missing _id',
      })
      if (Object.keys(req.body).length === 1) return res.json({
        error: 'no update field(s) sent',
        _id: req.body._id,
      })
      let errorObject = {
        error: 'could not update',
        _id: req.body._id,
      }
      let doc = await updateIssue(req.body, (err, data) => {
        if (err || !data) return res.json(errorObject)
        // console.log(data)
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
      let errorObject = {
        error: 'could not delete',
        _id: req.body._id,
      }
      if (Object.keys(req.body).length > 1) return res.json(errorObject)
      let doc = await deleteIssue(req.body._id, (err, data) => {
        if (err || !data) return res.json(errorObject)
        // console.log(data)
        res.json({
          result: 'successfully deleted',
          _id: req.body._id,
        })
      })
    });

};
