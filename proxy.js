export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Falta el parámetro url' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch(e) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  if (parsedUrl.protocol !== 'https:') {
    return res.status(403).json({ error: 'Solo se permiten URLs HTTPS' });
  }

  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'];
  if (blockedHosts.includes(parsedUrl.hostname)) {
    return res.status(403).json({ error: 'Host no permitido' });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PodcastProxy/1.0)' },
    });

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.setHeader('Content-Type', contentType);
    res.status(response.status).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el recurso', detail: err.message });
  }
}
