const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../app');
const { request } = require('chai');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(5000)

  suite('Testing the POST method and responses', () => {

    test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
      let myData = {
        issue_title: 'Completely made-up title',
        issue_text: 'Here is a simple issue. It is make-believe!',
        created_by: 'my own self',
        assigned_to: 'your mom',
      }
      chai
        .request(server)
        .post('/api/issues/my-own-test-project')
        .type('json')
        .send(myData)
        .end( (err, res) => {
          let data = res.body
          assert.equal(res.status, 200, 'return status should be 200')
          assert.isObject(data, 'returned object should be an object')
          assert.nestedInclude(data, myData, 'returned object should include the fields we sent')
          assert.property(data, 'created_on', 'returned object should have a "created_on" property')
          assert.isNumber(Date.parse(data.created_on), '"created_on" should successfully parse into a number')
          assert.property(data, 'updated_on', 'returned object should have a "updated_on" property')
          assert.isNumber(Date.parse(data.updated_on), '"updated_on" should successfully parse into a number')
          assert.property(data, 'open', 'returned object should have an "open" property')
          assert.isBoolean(data.open, 'the "open" property should be a boolean')
          assert.isTrue(data.open, 'the "open" property should be set to true')
          assert.property(data, '_id', 'the returned object should have an "_id" property')
          assert.isNotEmpty(data._id, 'the "_id" property should not be empty')
          assert.property(data, 'status_text', 'the returned object should have a "status_text" property')
          assert.isEmpty(data.status_text, 'the "status_text" property should be an empty string')
          done()
        })
    })

    test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
      let myData = {
        issue_title: 'This is the title',
        issue_text: 'this is the text',
        created_by: 'me myself and i',
      }
      chai
        .request(server)
        .post('/api/issues/my-own-test-project')
        .type('json')
        .send(myData)
        .end( (err, res) => {
          let data = res.body
          assert.equal(res.status, 200, 'return status should be 200')
          assert.isObject(data, 'returned object should be an object')
          assert.nestedInclude(data, myData, 'returned object should include the fields we sent')
          assert.property(data, 'created_on', 'returned object should have a "created_on" property')
          assert.isNumber(Date.parse(data.created_on), '"created_on" should successfully parse into a number')
          assert.property(data, 'updated_on', 'returned object should have a "updated_on" property')
          assert.isNumber(Date.parse(data.updated_on), '"updated_on" should successfully parse into a number')
          assert.property(data, 'open', 'returned object should have an "open" property')
          assert.isBoolean(data.open, 'the "open" property should be a boolean')
          assert.isTrue(data.open, 'the "open" property should default to true')
          assert.property(data, '_id', 'the returned object should have an "_id" property')
          assert.isNotEmpty(data._id, 'the "_id" property should not be empty')
          assert.property(data, 'status_text', 'the returned object should have a "status_text" property')
          assert.isEmpty(data.status_text, 'the "status_text" property should default to an empty string')
          assert.property(data, 'assigned_to', 'the returned object should have an "assigned_to" property')
          assert.isEmpty(data.assigned_to, 'the "assigned_to" property should default to an empty string')
          done()
        })
    })

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
      let myData = {
        issue_text: 'this will not make it',
      }
      chai
        .request(server)
        .post('/api/issues/my-own-test-project')
        .type('json')
        .send(myData)
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'returned object should be an object')
          assert.property(data, 'error', 'the returned object should have an "error" property')
          assert.equal(data.error, 'required field(s) missing')
          done()
        })
    })
  
  })

  suite('Testing the GET method and responses', () => {

    test('View issues on a project: GET request to /api/issues/{project}', (done) => {
      let myData = {
        issue_text: 'generic issue text',
        created_by: 'he who shall not be named',
      }
      let project = `my-own-test-project${Date.now().toString().substring(7)}`
      let url = `/api/issues/${project}`
      let characters = ['Harry Potter', 'Ron Weasley', 'Hermione Granger']
      chai
        .request(server)
        .post(url)
        .type('json')
        .send({ ...myData, issue_title: 'Harry Potter'})
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'issue creation should return an object')
          chai
            .request(server)
            .post(url)
            .type('json')
            .send({ ...myData, issue_title: 'Ron Weasley'})
            .end( (err, res) => {
              let data = res.body
              assert.isObject(data, 'issue creation should return an object')
              chai
                .request(server)
                .post(url)
                .type('json')
                .send({ ...myData, issue_title: 'Hermione Granger'})
                .end( (err, res) => {
                  let data = res.body
                  assert.isObject(data, 'issue creation should return an object')
                  chai
                    .request(server)
                    .get(url)
                    .end( (err, res) => {
                      let data = res.body
                      assert.isArray(data, 'the returned data should be an array')
                      assert.lengthOf(data, 3, 'the returned array should have 3 elements')
                      data.forEach((issue) => {
                        assert.property(issue, 'issue_title', 'the returned object should contain an "issue_title" property')
                        assert.nestedInclude(characters, issue.issue_title, 'the "issue_title" property should match one of the characters')
                        assert.property(issue, 'issue_text', 'the returned object should contain an "issue_title" property')
                        assert.property(issue, 'created_by', 'the returned object should contain an "created_by" property')
                        assert.property(issue, 'assigned_to', 'the returned object should contain an "assigned_to" property')
                        assert.property(issue, 'status_text', 'the returned object should contain an "status_text" property')
                        assert.property(issue, 'open', 'the returned object should contain an "open" property')
                        assert.property(issue, 'created_on', 'the returned object should contain an "created_on" property')
                        assert.property(issue, 'updated_on', 'the returned object should contain an "updated_on" property')
                        assert.property(issue, '_id', 'the returned object should contain an "_id" property')
                      })
                      done()
                    })
                })
            })
        })
    })

    test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
      let myData = {
        issue_text: 'some filtering sample',
        issue_title: 'Some Filtering Issue',
      }
      let project = `my-own-test-project${Date.now().toString().substring(7)}`
      let url = `/api/issues/${project}`
      let characters = ['TheMule', 'ThatGaiaLady', 'GaalDornick']
      chai
        .request(server)
        .post(url)
        .type('json')
        .send({ ...myData, created_by: 'TheMule', assigned_to: 'Alice' })
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'issue creation should return an object')
          chai
            .request(server)
            .post(url)
            .type('json')
            .send({ ...myData, created_by: 'ThatGaiaLady', assigned_to: 'Bob' })
            .end( (err, res) => {
              let data = res.body
              assert.isObject(data, 'issue creation should return an object')
              chai
                .request(server)
                .post(url)
                .type('json')
                .send({ ...myData, created_by: 'ThatGaiaLady', assigned_to: 'Alice' })
                .end( (err, res) => {
                  let data = res.body
                  assert.isObject(data, 'issue creation should return an object')
                  chai
                    .request(server)
                    .post(url)
                    .type('json')
                    .send({ ...myData, created_by: 'ThatGaiaLady', assigned_to: 'Bob' })
                    .end( (err, res) => {
                      let data = res.body
                      assert.isObject(data, 'issue creation should return an object')
                      chai
                        .request(server)
                        .post(url)
                        .type('json')
                        .send({ ...myData, created_by: 'GaalDornick', assigned_to: 'Carol' })
                        .end( (err, res) => {
                          let data = res.body
                          assert.isObject(data, 'issue creation should return an object')
                          chai
                            .request(server)
                            .get(url)
                            .query({ created_by: 'ThatGaiaLady' })
                            .end( (err, res) => {
                              let data = res.body
                              assert.isArray(data, 'the returned data should be an array')
                              assert.lengthOf(data, 3, 'the returned array should have 3 elements')
                              done()
                          })
                        })
                    })
                })
            })
        })
    })

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
      let myData = {
        issue_text: 'some filtering sample',
        issue_title: 'Some Filtering Issue',
      }
      let project = `my-own-test-project${Date.now().toString().substring(7)}`
      let url = `/api/issues/${project}`
      let characters = ['TheMule', 'ThatGaiaLady', 'GaalDornick']
      chai
        .request(server)
        .post(url)
        .type('json')
        .send({ ...myData, created_by: 'TheMule', assigned_to: 'Alice' })
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'issue creation should return an object')
          chai
            .request(server)
            .post(url)
            .type('json')
            .send({ ...myData, created_by: 'ThatGaiaLady', assigned_to: 'Bob' })
            .end( (err, res) => {
              let data = res.body
              assert.isObject(data, 'issue creation should return an object')
              chai
                .request(server)
                .post(url)
                .type('json')
                .send({ ...myData, created_by: 'ThatGaiaLady', assigned_to: 'Alice' })
                .end( (err, res) => {
                  let data = res.body
                  assert.isObject(data, 'issue creation should return an object')
                  chai
                    .request(server)
                    .post(url)
                    .type('json')
                    .send({ ...myData, created_by: 'ThatGaiaLady', assigned_to: 'Bob', open: false })
                    .end( (err, res) => {
                      let data = res.body
                      assert.isObject(data, 'issue creation should return an object')
                      chai
                        .request(server)
                        .post(url)
                        .type('json')
                        .send({ ...myData, created_by: 'GaalDornick', assigned_to: 'Carol' })
                        .end( (err, res) => {
                          let data = res.body
                          assert.isObject(data, 'issue creation should return an object')
                          chai
                            .request(server)
                            .get(url)
                            .query({ created_by: 'ThatGaiaLady', assigned_to: 'Bob', open: true })
                            .end( (err, res) => {
                              let data = res.body
                              assert.isArray(data, 'the returned data should be an array')
                              assert.lengthOf(data, 1, 'the returned array should have 1 elements')
                              done()
                            })
                        })
                    })
                })
            })
        })
    })
  })

  suite('Testing the PUT method and responses', () => {

    test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
      let myData = {
        issue_text: 'some updating sample',
        issue_title: 'Some Updating Issue',
        created_by: 'some guy',
      }
      chai
        .request(server)
        .post('/api/issues/my-own-test-project')
        .type('json')
        .send(myData)
        .end( (err, res) => {
          let data = res.body
          chai
            .request(server)
            .put('/api/issues/my-own-test-project')
            .type('json')
            .send({
              _id: data._id,
              issue_text: 'updated issue text',
            })
            .end( (err, res) => {
              let data = res.body
              let _id = res.request._data._id
              assert.isObject(data, 'return from a PUT operation should be an object')
              assert.deepEqual(data, {
                result: 'successfully updated',
                _id: _id,
              }, 'return object from a PUT operation should be a success message')
              chai
                .request(server)
                .get('/api/issues/my-own-test-project')
                .query({ _id: _id })
                .end( (err, res) => {
                  let data = res.body
                  assert.isArray(data, 'querying for the updated _id should return an array')
                  assert.isObject(data[0], 'the returned array should contain an object item')
                  assert.isAbove(
                    Date.parse(data[0].updated_on),
                    Date.parse(data[0].created_on),
                    'for an updated issue, "updated_on" should be greater than "created_on"',
                  )
                  done()
                })
            })
        })
    })

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
      let myData = {
        issue_text: 'multiple updating sample',
        issue_title: 'Multiple Updating Issue',
        created_by: 'many guys',
      }
      chai
        .request(server)
        .post('/api/issues/my-own-test-project')
        .type('json')
        .send(myData)
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'the created issue should be returned as an object')
          assert.isEmpty(data.assigned_to, 'the initial value of "assigned_to" should be empty')
          chai
            .request(server)
            .put('/api/issues/my-own-test-project')
            .type('json')
            .send({
              _id: data._id,
              created_by: 'more than one guys',
              assigned_to: 'sXe Phil',
            })
            .end( (err, res) => {
              let data = res.body
              let _id = res.request._data._id
              assert.isObject(data, 'return from a PUT operation should be an object')
              assert.deepEqual(data, {
                result: 'successfully updated',
                _id: _id,
              }, 'return object from a PUT operation should be a success message')
              chai
                .request(server)
                .get('/api/issues/my-own-test-project')
                .query({ _id: _id })
                .end( (err, res) => {
                  let data = res.body
                  assert.isArray(data, 'querying for the updated _id should return an array')
                  assert.isObject(data[0], 'the returned array should contain an object item')
                  assert.isNotEmpty(data[0].assigned_to, 'the returned property "assigned_to" should now have a value')
                  assert.isAbove(
                    Date.parse(data[0].updated_on),
                    Date.parse(data[0].created_on),
                    'for an updated issue, "updated_on" should be greater than "created_on"',
                  )
                  done()
                })
            })
        })
    })

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .put('/api/issues/my-own-test-project')
        .type('json')
        .send({
          created_by: 'nobody',
          issue_text: 'will see this',
        })
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'return from a bad PUT request should be an object')
          assert.property(data, 'error', 'the returned object should have an "error" property')
          assert.equal(data.error, 'missing _id', 'the returned object should contain a helpful error message')
          done()
        })
    })

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .put('/api/issues/my-own-test-project')
        .type('json')
        .send({
          _id: '5f665eb46e296f6b9b6a504d',
        })
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'return from a bad PUT request should be an object')
          assert.deepEqual(data, {
            error: 'no update field(s) sent',
            _id: '5f665eb46e296f6b9b6a504d',
          }, 'the returned object should contain a helpful error message')
          done()
        })
    })

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .put('/api/issues/my-own-test-project')
        .type('json')
        .send({
          _id: '5f665eb46e296f6b9b6a504d',
          issue_text: 'text for non-existing update',
        })
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'return from a bad PUT request should be an object')
          assert.deepEqual(data, {
            error: 'could not update',
            _id: '5f665eb46e296f6b9b6a504d',
          }, 'the returned object should contain a less-than-helpful error message')
          done()
        })
    })

  })

  suite('Testing the DELETE method and responses', () => {

    test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
      let myData = {
        issue_text: 'deleting issue sample',
        issue_title: 'Sample Deleting Issue',
        created_by: 'a dude',
      }
      chai
        .request(server)
        .post('/api/issues/my-own-test-project')
        .type('json')
        .send(myData)
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'the created issue should be returned as an object')
          chai
            .request(server)
            .delete('/api/issues/my-own-test-project')
            .type('json')
            .send({
              _id: data._id,
            })
            .end( (err, res) => {
              let data = res.body
              let _id = res.request._data._id
              assert.isObject(data, 'return from a successful DELETE operation should be an object')
              assert.deepEqual(data, {
                result: 'successfully deleted',
                _id: _id,
              }, 'return object from a DELETE operation should be a success message')
              done()
            })
        })
    })

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .delete('/api/issues/my-own-test-project')
        .type('json')
        .send({
          _id: '5f665eb46e296f6b9b6a504d',
        })
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'return from a DELETE operation with invalid _id should be an object')
          assert.deepEqual(data, {
            error: 'could not delete',
            _id: '5f665eb46e296f6b9b6a504d',
          }, 'returned object should contain a helpful error message')
          done()
        })
    })

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .delete('/api/issues/my-own-test-project')
        .type('json')
        .end( (err, res) => {
          let data = res.body
          assert.isObject(data, 'return from a DELETE operation with a missing _id should be an object')
          assert.deepEqual(data, { error: 'missing _id' }, 'returned object should contain a helpful error message')
          done()
        })
    })
  
  })
  
});
