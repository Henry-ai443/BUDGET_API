(async () => {
  const base = 'http://localhost:3000';
  const rnd = Math.floor(Math.random() * 1000000);
  const email = `testuser+${rnd}@example.com`;
  const password = 'password123';
  const username = `user${rnd}`;

  function out(label, obj) { console.log('\n=== ' + label + ' ==='); console.log(JSON.stringify(obj, null, 2)); }

  // register
  let res = await fetch(base + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, currency: 'USD' })
  });
  const reg = await res.json();
  out('register', { status: res.status, body: reg });

  // login
  res = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const login = await res.json();
  out('login', { status: res.status, body: login });
  if (!login.token) {
    console.error('Login failed, aborting smoke test');
    process.exit(1);
  }
  const token = login.token;

  // create transactions
  const txs = [
    { type: 'expense', amount: 12.5, category: 'food', note: 'lunch' },
    { type: 'expense', amount: 60, category: 'transport', note: 'uber' },
    { type: 'income', amount: 500, category: 'salary', note: 'paycheck' },
  ];

  for (const t of txs) {
    res = await fetch(base + '/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(t)
    });
    const created = await res.json();
    out('create tx', { status: res.status, body: created });
  }

  // call insights
  res = await fetch(base + '/api/insights?days=30', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  const insights = await res.json();
  out('insights', { status: res.status, body: insights });

  console.log('\nSmoke test completed');
  process.exit(0);
})();
