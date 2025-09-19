export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      DATABASE_URL: !!process.env.DATABASE_URL,
      NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
      NETLIFY_DATABASE_URL_UNPOOLED: !!process.env.NETLIFY_DATABASE_URL_UNPOOLED
    })
  };
}
