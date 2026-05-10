const express  = require('express');
const session  = require('express-session');
const bcrypt   = require('bcrypt');
const path     = require('path');
const crypto   = require('crypto');

const app  = express();
const PORT = 8181;

// ─── UŽIVATELÉ ────────────────────────────────────────────────────────────────
// Změna hesla: node -e "require('bcrypt').hash('noveheslo',12).then(h=>console.log(h))"
const USERS = {
    investor: {
        hash:  '$2b$12$6cPVtghCBQs2eEg37yBwl.6izILLN5PTHIFQNOFayJZWt6btbKlKa',
        label: 'Investor',
        color: '#818cf8',   // indigo
    },
    poradce: {
        hash:  '$2b$12$RpDly.nHnylJ5X04SJTDU.JLwvKlsznevoiE.QB2VKKZVQQ80ysw2',
        label: 'Poradce',
        color: '#34d399',   // emerald
    },
    makler: {
        hash:  '$2b$12$3BHmNQQKH3bJOTH2vcP73ubllh54EVmB2Xc.1/XyS8mr4D5Gr/Ina',
        label: 'Makléř',
        color: '#fb923c',   // orange
    },
};
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_SECRET = crypto.randomBytes(32).toString('hex');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000,
    }
}));

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    if (req.session && req.session.username) return next();
    res.redirect('/login');
}

// ─── LOGIN STRÁNKA ────────────────────────────────────────────────────────────
app.get('/login', (req, res) => {
    if (req.session && req.session.username) return res.redirect('/admin');
    const err      = req.query.error ? 'Nesprávné jméno nebo heslo.' : '';
    const safeUser = ['investor', 'poradce', 'makler'].includes(req.query.user) ? req.query.user : '';
    res.send(`<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GRAN VIA — Přihlášení</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Inter', sans-serif;
    background: #F4F6FB;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card {
    width: 420px;
    background: #fff;
    border: 1px solid #E8ECF4;
    border-radius: 16px;
    padding: 2.5rem 2rem 2rem;
    box-shadow: 0 4px 32px rgba(26,35,64,.07);
  }
  .logo-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 2rem;
  }
  .logo-icon {
    width: 48px; height: 48px;
    background: #E5A025;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 1rem; color: #fff; letter-spacing: .5px;
  }
  .logo-title {
    font-weight: 700; font-size: 1.1rem; letter-spacing: 3px;
    text-transform: uppercase; color: #1A2340;
  }
  .logo-sub {
    font-size: .72rem; letter-spacing: 2px; text-transform: uppercase;
    color: #8C93A8; font-weight: 500; margin-top: -6px;
  }
  .section-label {
    font-size: .72rem; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: #8C93A8; margin-bottom: 8px;
  }
  .profiles {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 8px;
    margin-bottom: 1.4rem;
  }
  .profile-btn {
    background: #F4F6FB; border: 1.5px solid #E8ECF4; border-radius: 10px;
    padding: .75rem .5rem .65rem; cursor: pointer;
    font-family: 'Inter', sans-serif; font-size: .75rem; font-weight: 600;
    letter-spacing: .5px; color: #8C93A8; text-transform: uppercase;
    transition: all .15s; text-align: center;
  }
  .profile-btn:hover { border-color: #8C93A8; color: #1A2340; background: #fff; }
  .profile-btn.active {
    border-color: #1A2340; background: #fff; color: #1A2340;
    box-shadow: 0 0 0 3px rgba(26,35,64,.07);
  }
  .pdot {
    width: 8px; height: 8px; border-radius: 50%;
    margin: 0 auto 7px; transition: box-shadow .15s;
  }
  .profile-btn.active .pdot { box-shadow: 0 0 0 3px rgba(0,0,0,.08); }
  .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 1.1rem; }
  .field label {
    font-size: .72rem; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: #8C93A8;
  }
  .field input {
    width: 100%; border: 1.5px solid #E8ECF4; border-radius: 9px;
    padding: .72rem 1rem; font-family: 'Inter', sans-serif;
    font-size: .95rem; color: #1A2340; background: #fff;
    outline: none; transition: border-color .2s; letter-spacing: 2px;
  }
  .field input:focus { border-color: #E5A025; }
  .field input::placeholder { color: #C4CAD8; letter-spacing: 1px; }
  .btn-submit {
    width: 100%; background: #1A2340; color: #fff; border: none;
    border-radius: 9px; font-family: 'Inter', sans-serif; font-size: .82rem;
    font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    padding: .9rem; cursor: pointer; transition: opacity .15s;
  }
  .btn-submit:hover { opacity: .85; }
  .err {
    font-size: .78rem; color: #DC2626; text-align: center;
    min-height: 1.2em; margin-top: .75rem; letter-spacing: .3px;
  }
  @keyframes shake {
    0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)}
    40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
  }
  .shake { animation: shake .35s ease; }
</style>
</head>
<body>
<div class="card">
  <div class="logo-wrap">
    <div class="logo-icon">GV</div>
    <div class="logo-title">Gran Via</div>
    <div class="logo-sub">Přístup do správy</div>
  </div>

  <div class="section-label">Vyberte profil</div>
  <div class="profiles">
    <div class="profile-btn" onclick="selectProfile('investor')" id="p-investor">
      <div class="pdot" style="background:#818cf8"></div>Investor
    </div>
    <div class="profile-btn" onclick="selectProfile('poradce')" id="p-poradce">
      <div class="pdot" style="background:#34d399"></div>Poradce
    </div>
    <div class="profile-btn" onclick="selectProfile('makler')" id="p-makler">
      <div class="pdot" style="background:#fb923c"></div>Makléř
    </div>
  </div>

  <form method="POST" action="/api/login" id="form">
    <input type="hidden" name="username" id="username-input" value="">
    <div class="field">
      <label>Heslo</label>
      <input type="password" name="password" id="pwd" placeholder="••••••••" autofocus>
    </div>
    <button type="button" class="btn-submit" onclick="submitForm()">Přihlásit se</button>
  </form>
  <div class="err" id="err-msg">${err}</div>
</div>
<script>
  function selectProfile(u) {
    document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('p-' + u).classList.add('active');
    document.getElementById('username-input').value = u;
    document.getElementById('pwd').focus();
  }
  function submitForm() {
    const errEl = document.getElementById('err-msg');
    if (!document.getElementById('username-input').value) {
      errEl.textContent = 'Vyberte profil.';
      document.querySelector('.profiles').classList.add('shake');
      setTimeout(() => document.querySelector('.profiles').classList.remove('shake'), 400);
      return;
    }
    document.getElementById('form').submit();
  }
  document.getElementById('pwd').addEventListener('keydown', e => { if (e.key === 'Enter') submitForm(); });
  ${safeUser ? `selectProfile('${safeUser}')` : ''}
</script>
</body></html>`);
});

// ─── API: přihlášení ─────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = USERS[username];
    if (!user) return res.redirect(`/login?error=1&user=${encodeURIComponent(username || '')}`);
    try {
        const match = await bcrypt.compare(password || '', user.hash);
        if (match) {
            req.session.username = username;
            req.session.label    = user.label;
            req.session.color    = user.color;
            res.redirect('/admin');
        } else {
            res.redirect(`/login?error=1&user=${encodeURIComponent(username)}`);
        }
    } catch {
        res.redirect('/login?error=1');
    }
});

// ─── API: aktuální uživatel ───────────────────────────────────────────────────
app.get('/api/me', requireAuth, (req, res) => {
    res.json({
        username: req.session.username,
        label:    req.session.label,
        color:    req.session.color,
    });
});

// ─── API: odhlášení ──────────────────────────────────────────────────────────
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// ─── ADMIN (chráněno) ────────────────────────────────────────────────────────
app.get('/admin', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ─── Veřejné soubory ─────────────────────────────────────────────────────────
app.use(express.static(__dirname, {
    index: 'index.html',
    extensions: ['html'],
}));

app.get('/*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  GRAN VIA server běží na http://localhost:${PORT}`);
    console.log(`  Admin:    http://localhost:${PORT}/admin`);
    console.log(`\n  Profily a hesla:`);
    console.log(`    investor → investor2026`);
    console.log(`    poradce  → poradce2026`);
    console.log(`    makler   → makler2026\n`);
});
