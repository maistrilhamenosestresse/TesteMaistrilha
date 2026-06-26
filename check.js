fetch('https://maistrilhasmenosestresse.com/cadastro')
  .then(r => r.text())
  .then(t => {
    const lines = t.split('\n');
    lines.forEach(l => {
      if (l.includes('og:image')) console.log(l.trim());
    });
  })
  .catch(console.error);
