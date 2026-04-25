import { Polar } from "@polar-sh/sdk";

export const getPolarClient = () => {
  const config = useRuntimeConfig();
  const token = config.private.polarAccessToken;
  const server = config.private.polarServer as "sandbox" | "production";

  if (!token) {
    throw new Error("Missing POLAR_ACCESS_TOKEN in runtime config");
  }

  return new Polar({
    accessToken: token,
    server,
  });
};
