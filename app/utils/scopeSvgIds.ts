/**
 * Prefix IDs inside <defs> of an inline SVG and update all references.
 * This prevents collisions when multiple SVGs use the same ids (masks, gradients, etc.).
 *
 * - Only elements within <defs> are renamed to avoid breaking external queries for on-stage nodes
 * - Updates attributes that commonly reference IDs: fill, stroke, filter, clip-path, mask,
 *   href, xlink:href, marker-start/mid/end, and inline style declarations
 */

/**
 * Scope SVG defs IDs with a unique prefix
 */
export function scopeSvgDefsIds(svgEl: SVGElement | null, prefix: string): Map<string, string> {
  if (!svgEl || !prefix) return new Map()

  const idMap = new Map<string, string>()
  const defsNodes = svgEl.querySelectorAll('defs')

  // Collect and rename IDs inside all <defs>
  defsNodes.forEach((defs) => {
    defs.querySelectorAll('[id]').forEach((node) => {
      const oldId = node.getAttribute('id')
      if (!oldId) return
      const newId = `${prefix}-${oldId}`
      idMap.set(oldId, newId)
      node.setAttribute('id', newId)
    })
  })

  if (idMap.size === 0) return idMap

  // Attributes that may contain url(#id) or #id references
  const ATTRS = [
    'fill',
    'stroke',
    'filter',
    'clip-path',
    'mask',
    'href',
    'xlink:href',
    'marker-start',
    'marker-mid',
    'marker-end',
    'style'
  ]

  // Update references across whole SVG tree
  svgEl.querySelectorAll('*').forEach((node) => {
    ATTRS.forEach((attr) => {
      const val = node.getAttribute(attr)
      if (!val) return

      let newVal = val
      idMap.forEach((newId, oldId) => {
        // Replace url(#oldId)
        newVal = newVal.replace(
          new RegExp(`url\\(#${oldId}\\)`, 'g'),
          `url(#${newId})`
        )
        // Replace bare #oldId (href/xlink:href)
        newVal = newVal.replace(
          new RegExp(`#${oldId}(\\b)`, 'g'),
          `#${newId}$1`
        )
      })

      if (newVal !== val) node.setAttribute(attr, newVal)
    })
  })

  return idMap
}

/**
 * Helper to remap CSS id selectors like "#mask" to a prefixed variant if present in idMap.
 * Leaves non-id selectors unchanged.
 */
export function remapIdSelectors(selector: string, idMap: Map<string, string>): string {
  if (!selector || !idMap || idMap.size === 0) return selector
  return selector.replace(/#([A-Za-z0-9_-]+)/g, (match, id) => {
    return idMap.has(id) ? `#${idMap.get(id)}` : match
  })
}
