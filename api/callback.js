const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Código não fornecido pelo Discord.');

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) return res.status(400).send('Erro no Discord Token.');

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    const uid = `discord:${userData.id}`;
    const email = userData.email || null;
    const displayName = userData.global_name || userData.username;
    const photoURL = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null;

    try {
        await admin.auth().getUser(uid);
        await admin.auth().updateUser(uid, { displayName, photoURL });
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            await admin.auth().createUser({ uid, email, displayName, photoURL });
        } else throw e;
    }

    const customToken = await admin.auth().createCustomToken(uid);
    res.redirect(`${process.env.FRONTEND_URL}?token=${customToken}`);

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no servidor ao tentar logar com Discord.');
  }
};