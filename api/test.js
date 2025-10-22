export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: '🎉 VERCEL FUNCTIONS ARE WORKING!',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasSTEAM_API_KEY: !!process.env.STEAM_API_KEY,
      hasDISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
      steamKeyPreview: process.env.STEAM_API_KEY ? 
        process.env.STEAM_API_KEY.substring(0, 8) + '...' : 'MISSING'
    }
  });
}