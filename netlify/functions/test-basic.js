// Ultra basic test function
const handler = (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    body: 'FUNCTIONS WORK!'
  })
}

module.exports = { handler }