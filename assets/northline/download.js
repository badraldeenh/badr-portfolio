const button = document.getElementById('download-source');
const status = document.getElementById('download-status');
button.addEventListener('click', async () => {
  button.disabled = true;
  try {
    status.textContent = 'Preparing download…';
    const manifestResponse = await fetch('/assets/northline/source-manifest.json');
    if (!manifestResponse.ok) throw new Error('manifest');
    const manifest = await manifestResponse.json();
    const chunks = [];
    let received = 0;
    for (const part of manifest.parts) {
      const response = await fetch(part.url);
      if (!response.ok) throw new Error('download');
      const reader = response.body.getReader();
      const buffers = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffers.push(value); size += value.length; received += value.length;
        status.textContent = `Downloading source files… ${Math.round(received / manifest.size * 100)}%`;
      }
      if (size !== part.size) throw new Error('size');
      const bytes = new Uint8Array(await new Blob(buffers).arrayBuffer());
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== part.sha256) throw new Error('integrity');
      chunks.push(bytes);
    }
    const url = URL.createObjectURL(new Blob(chunks, { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url; link.download = manifest.filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    status.textContent = 'Download ready — check your Downloads folder.';
  } catch (error) {
    status.textContent = 'Download interrupted. Please try again.';
  } finally { button.disabled = false; }
});
