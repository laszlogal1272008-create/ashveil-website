exports.handler = async (event, context) => {
  console.log('✅ MINIMAL TEST FUNCTION WORKING');
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      message: 'FUNCTIONS WORK!',
      timestamp: new Date().toISOString(),
      steamKeyExists: !!process.env.STEAM_API_KEY
    })
  };
};