addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 对根路径的请求进行重定向到 Notion
  if (url.pathname === '/') {
    return Response.redirect('https://apexplan.notion.site', 301);
  }
  
  // 更改请求的主机名为 Notion 的自定义域
  url.hostname = 'apexplan.notion.site';

  // 保持大部分原始请求头，特别是 User-Agent
  const headers = new Headers(request.headers);
  // 设置 Referer 为 Notion 域，以适应一些安全策略
  headers.set('Referer', 'https://apexplan.notion.site');

  // 执行请求，保持原始的请求方式和请求头
  const response = await fetch(url.toString(), { headers, redirect: 'manual' });

  // 处理 Notion 可能发出的重定向
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('Location');
    if (location) {
      return Response.redirect(location, response.status);
    }
  }

  // 创建新响应，允许跨域访问
  const newResponseHeaders = new Headers(response.headers);
  newResponseHeaders.set('Access-Control-Allow-Origin', '*');
  newResponseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  newResponseHeaders.set('Access-Control-Allow-Headers', '*');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newResponseHeaders
  });
}
