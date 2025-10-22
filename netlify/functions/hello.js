exports.handler = async (event, context) => {
  console.log('Function called:', event.path)
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: '🎉 NETLIFY FUNCTIONS WORKING!',
      path: event.path,
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    })
  }
}