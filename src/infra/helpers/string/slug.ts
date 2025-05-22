/**
 * Receives a string and normalize it as a slug
 *
 * Example: "An example title" => "an-example-title"
 *
 * @param text {string}
 */
function slug(text: string): string {
  if (!text) return ''

  const slugText = text
    .normalize('NFKD')
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/_/g, '-')
    .replace(/--+/g, '-')
    .replace(/-$/g, '')

  return slugText
}

export { slug }
