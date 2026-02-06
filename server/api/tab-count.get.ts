export default defineEventHandler(() => {
  const tabCount = Math.floor(Math.random() * (73 - 7 + 1)) + 7
  return { tabCount }
})
