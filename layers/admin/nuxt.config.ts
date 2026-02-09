import { fileURLToPath } from "node:url";

// Admin layer configuration
export default defineNuxtConfig({
  alias: {
    "~admin": fileURLToPath(new URL("./", import.meta.url)),
  },
})
