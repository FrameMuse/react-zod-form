import { defineConfig } from "rollup"
import { swc } from "rollup-plugin-swc3"

const baseConfig = defineConfig({
  treeshake: true,
  external: [/react.*/, /@swc\/helpers\/.*/, "lodash"],
  input: "./src/index.ts",
  output: {
    format: "esm",
    file: "dist/index.js",
    sourcemap: true,
    preserveModules: false,
    exports: "auto"
  },
})
const config = defineConfig([
  {
    ...baseConfig,
    plugins: [
      swc({
        jsc: {
          loose: true,
          externalHelpers: false,
          parser: {
            syntax: "typescript",
            dynamicImport: true,
            tsx: true,
          },
          transform: {
            react: {
              pragma: "React.createElement",
              pragmaFrag: "React.Fragment",
              throwIfNamespace: true,
              development: false,
              useBuiltins: true,
            },
          },
          minify: {
            sourceMap: true
          }
        },
        minify: true
      })
    ]
  }
])

export default config
