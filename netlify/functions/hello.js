exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'SUCCESS: Netlify Functions are working!'
  }
}