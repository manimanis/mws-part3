this.onmessage = startWorker;

function startWorker(e) {
  let ul = '<ul>';
  for (let i = 0; i < 500; i++) {
    const li = `<li>Ligne n° ${i+1}</li>`;
    ul += li;
  }
  ul += '</ul>';
  setTimeout(() => {
    postMessage(ul);
  }, 2000);
}