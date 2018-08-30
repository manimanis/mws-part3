this.onmessage = startWorking;

function startWorking(e) {
  e.data.css.forEach(item => {
    fetch(item.href)
      .then(response => response.blob())
      .then(href => URL.createObjectURL(href))
      .then(css => postMessage({ type: 'css', index: item.index, data: css}))
      .then(() => console.log(item.href))
      .catch(error => postMessage({ type: 'css', index: item.index, data: null}));
  });

  e.data.js.forEach(item => {
    fetch(item.href)
      .then(response => response.blob())
      .then(href => URL.createObjectURL(href))
      .then(css => postMessage({ type: 'js', index: item.index, data: css}))
      .then(() => console.log(item.href))
      .catch(error => postMessage({ type: 'js', index: item.index, data: null}));
  });
}