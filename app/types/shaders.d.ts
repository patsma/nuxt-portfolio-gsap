/**
 * Type declarations for GLSL shader imports
 * Vite's ?raw suffix returns the file content as a string
 */
declare module '*.glsl?raw' {
  const content: string
  export default content
}

declare module '*.glsl' {
  const content: string
  export default content
}

declare module '*.vert?raw' {
  const content: string
  export default content
}

declare module '*.frag?raw' {
  const content: string
  export default content
}
