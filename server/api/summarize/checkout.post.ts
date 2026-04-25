export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  const userId = (session.user as { id: string }).id;

  // Construction of robust URLs to ensure we stay on ngrok tunnel
  const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host');
  const isTunnel = host?.includes('ngrok-free.app');
  const protocol = isTunnel ? 'https' : (host?.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;
  
  // Use forced success URL from request host to bypass stale config
  const successUrl = `${baseUrl}/checkout/success?checkout_id={CHECKOUT_ID}`;
  const returnUrl = `${baseUrl}/checkout/failure`;

  const handler = Checkout({
    accessToken: config.private.polarAccessToken,
    successUrl,
    returnUrl,
    server: config.private.polarServer as "sandbox" | "production",
  });

  // Set a secure cookie with the unique user ID
  setCookie(event, 'checkout_user', userId, {
    maxAge: 60 * 15, // 15 minutes
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return handler(event);
});
