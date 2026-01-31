import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    private: {
      jinaAiKey: process.env.JINA_AI_API_KEY,
      openrouterKey: process.env.OPENROUTER_API_KEY,
    },
  },

  nitro: {
    imports: {
      dirs: ['server/db'],
    },
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/icon",
    "@nuxt/image",
    '@nuxt/content',
    "@nuxt/scripts",
    "shadcn-nuxt",
    "@radya/nuxt-dompurify",
    "@nuxtjs/mdc",
  ],

  css: ["~/assets/css/global.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "@/components/ui",
  },
});
