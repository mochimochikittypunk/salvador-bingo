export default function handler(req: any, res: any) {
  const clientId = process.env.BASE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send('BASE_CLIENT_ID is not configured in Vercel. Please add it to Environment Variables.');
  }
  
  const redirectUri = 'https://bingo-neon-ten.vercel.app/api/auth/callback';
  const url = `https://api.thebase.in/1/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_orders&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.redirect(url);
}
