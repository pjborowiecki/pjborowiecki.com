import { resolve } from "node:path"
import { type PluginOption, type UserConfig, defineConfig, lazyPlugins, loadEnv } from "vite-plus"

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./src/integrations/use-intl/i18n.locales.ts"
import { ROUTES } from "./src/routes.ts"

const projectRoot = import.meta.dirname

const DEV_SERVER_PORT = 3001

const LOCALIZED_PAGES = SUPPORTED_LOCALES.map((locale) => ({ path: locale === DEFAULT_LOCALE ? ROUTES.HOME : `/${locale}` }))

const shouldPrerender = ({ path }: { path: string }): boolean => !path.includes("?") && !path.includes("#")

const ignorePatterns = [
  "**/*.d.ts",
  "**/*.tsbuildinfo",
  ".agents",
  ".claude",
  ".source",
  ".tanstack",
  ".vscode",
  ".wrangler",
  "blob-report",
  "coverage",
  "dist",
  "node_modules",
  "opensrc",
  "playwright-report",
  "playwright/.cache",
  "src/routeTree.gen.ts",
  "src/types/worker-configuration.d.ts",
  "test-results",
]

const BROWSER_VERIFIED = [
  "src/lib/hero-studio.ts",
  "src/lib/system-diagram-frame.ts",
  "src/presentation/components/custom/{custom-cursor,mobile-menu,navigation,smooth-scroll}.tsx",
  "src/presentation/components/custom/landing-page/sections/**",
  "src/presentation/components/custom/landing-page/components/{case-study-panel,expertise-figure,harness-diagram,image-reveal,marquee,project-index,project-showcase,reveal,section-head,split-heading}.tsx",
  "src/presentation/components/custom/landing-page/components/system-diagram*.tsx",
]

const tooling = {
  fmt: {
    arrowParens: "always",
    bracketSpacing: true,
    endOfLine: "lf",
    ignorePatterns,
    jsxSingleQuote: false,
    printWidth: 140,
    semi: false,
    singleQuote: false,
    sortImports: {
      customGroups: [
        {
          elementNamePattern: ["@tanstack/react-start/server-only"],
          groupName: "server-only",
        },
        {
          elementNamePattern: ["cloudflare:workers"],
          groupName: "cloudflare",
        },
        {
          elementNamePattern: ["~/src/presentation/components/shadcn/**"],
          groupName: "components-shadcn",
        },
        {
          elementNamePattern: ["~/src/presentation/components/custom/**"],
          groupName: "components-custom",
        },
        {
          elementNamePattern: ["~/src/presentation/components/**"],
          groupName: "components-other",
        },
        {
          elementNamePattern: ["~/src/presentation/branding/**"],
          groupName: "branding",
        },
        {
          elementNamePattern: ["~/src/data", "~/src/data/**"],
          groupName: "constants",
        },
        {
          elementNamePattern: ["~/src/hooks/**"],
          groupName: "hooks",
        },
        {
          elementNamePattern: ["~/src/integrations/**"],
          groupName: "integrations",
        },
        {
          elementNamePattern: ["~/src/lib/**"],
          groupName: "lib",
        },
        {
          elementNamePattern: ["~/src/platform/**"],
          groupName: "platform",
        },
        {
          elementNamePattern: ["~/src/providers/**"],
          groupName: "providers",
        },
        {
          elementNamePattern: ["react", "react/**", "react-dom", "react-dom/**"],
          groupName: "react",
        },
        {
          elementNamePattern: ["~/src/routes/**"],
          groupName: "routes",
        },
        {
          elementNamePattern: ["~/src/presentation/styles/**"],
          groupName: "styles",
        },
        {
          elementNamePattern: ["~/src/types/**"],
          groupName: "types",
        },
      ],
      groups: [
        "server-only",
        "cloudflare",
        "react",
        ["builtin", "external"],
        "platform",
        "providers",
        "integrations",
        "routes",
        "hooks",
        "constants",
        "types",
        "lib",
        "branding",
        "components-shadcn",
        "components-custom",
        "components-other",
        "styles",
        ["internal", "parent", "sibling", "index"],
        "unknown",
      ],
      ignoreCase: true,
      newlinesBetween: true,
      sortSideEffects: true,
    },
    sortPackageJson: { sortScripts: true },
    sortTailwindcss: {
      attributes: ["className", "classList"],
      functions: ["clsx", "cn", "cva", "tw"],
      stylesheet: "./src/presentation/styles/globals.css",
    },
    tabWidth: 2,
    trailingComma: "all",
    useTabs: false,
  },
  lint: {
    categories: {
      correctness: "error",
      nursery: "error",
      pedantic: "error",
      perf: "error",
      style: "error",
      suspicious: "error",
    },
    env: { browser: true, es2024: true, node: true, worker: true },
    globals: { HTMLRewriter: "readonly", caches: "readonly" },
    ignorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        files: ["src/**/*.test.{ts,tsx}", "src/**/__test__/**", "src/platform/testing/**", "e2e/**"],
        rules: {
          "no-await-in-loop": "off",
          "no-magic-numbers": "off",
          "unicorn/no-null": "off",
        },
      },
      {
        files: ["src/presentation/**", "src/hooks/**"],
        rules: { "typescript/consistent-return": "off" },
      },
      {
        files: ["src/platform/testing/mocks/**"],
        rules: { "require-await": "off", "typescript/require-await": "off" },
      },
      {
        files: ["src/routes/**"],
        rules: { "sort-keys": "off" },
      },
      {
        files: ["vite.config.ts"],
        rules: {
          "max-lines": "off",
        },
      },
    ],
    rules: {
      "id-length": ["error", { exceptions: ["_", "m", "t"], properties: "never" }],
      "max-lines": ["error", { max: 800 }],
      "max-lines-per-function": ["error", { max: 150 }],
      "max-statements": ["error", { max: 20 }],
      "new-cap": ["error", { properties: false }],
      "no-magic-numbers": ["error", { ignore: [0], ignoreArrayIndexes: true, ignoreDefaultValues: true, ignoreTypeIndexes: true }],
      "no-ternary": "off",
      "no-underscore-dangle": ["error", { allow: ["_splat", "__executeServer"] }],
      "one-var": ["error", "never"],
      "sort-imports": ["error", { ignoreDeclarationSort: true }],
      "typescript/no-explicit-any": "error",
      "typescript/only-throw-error": [
        "error",
        {
          allow: [
            { from: "package", name: "NotFoundError", package: "@tanstack/router-core" },
            { from: "package", name: "Redirect", package: "@tanstack/router-core" },
          ],
        },
      ],
      "typescript/prefer-readonly-parameter-types": "off",
      "unicorn/no-useless-undefined": ["error", { checkArguments: false }],
    },
  },
} satisfies Pick<UserConfig, "fmt" | "lint">

export default defineConfig(({ mode }) => ({
  ...tooling,
  define: { "import.meta.env.BUILD_YEAR": JSON.stringify(String(new Date().getFullYear())) },
  plugins:
    lazyPlugins(async (): Promise<PluginOption[]> => {
      const { cloudflare } = await import("@cloudflare/vite-plugin")
      const { tanstackStart } = await import("@tanstack/react-start/plugin/vite")

      const { default: tailwindcss } = await import("@tailwindcss/vite")
      const { default: viteReact } = await import("@vitejs/plugin-react")
      const { deployedWorker } = await import("./scripts/deployed-worker.ts")
      const { serverMotion } = await import("./scripts/server-motion.ts")

      if (process.env["VITEST"] === "true") {
        return [viteReact()]
      }

      return [
        cloudflare({
          inspectorPort: false,
          persistState: mode === "test" ? { path: ".wrangler/test" } : true,
          remoteBindings: mode !== "test" && process.env["CLOUDFLARE_ENV"] === "development",
          viteEnvironment: { name: "ssr" },
        }),
        serverMotion(),
        tailwindcss(),
        tanstackStart({
          pages: LOCALIZED_PAGES,
          prerender: {
            autoStaticPathsDiscovery: true,
            crawlLinks: true,
            enabled: true,
            filter: shouldPrerender,
          },
          router: {
            codeSplittingOptions: { defaultBehavior: [["component"], ["loader"], ["errorComponent"], ["notFoundComponent"]] },
            routeFileIgnorePattern: "__test__",
          },
        }),
        viteReact(),
        deployedWorker(),
      ]
    }) ?? [],
  resolve: { tsconfigPaths: true },
  server: { port: DEV_SERVER_PORT, strictPort: true, watch: { ignored: ["**/coverage/**"] } },
  staged: { "*": "vp check --fix" },
  test: {
    alias: [{ find: "cloudflare:workers", replacement: resolve(projectRoot, "src/platform/testing/mocks/cloudflare.ts") }],
    coverage: {
      clean: true,
      exclude: [
        "**/*.{test,spec}.{ts,tsx}",
        "**/__test__/**",
        "**/*.d.ts",
        "src/routeTree.gen.ts",
        "src/presentation/components/shadcn/**",
        "src/platform/testing/**",
        ...BROWSER_VERIFIED,
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    deps: {
      interopDefault: true,
    },
    env: loadEnv("test", projectRoot, ""),
    environment: "node",
    exclude: ["node_modules/**", "dist/**", "build/**", "e2e/**"],
    globals: true,
    isolate: true,
    passWithNoTests: false,
    pool: "threads",
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          exclude: ["src/**/*.component.test.{ts,tsx}"],
          include: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/__test__/**/*.{test,spec}.{ts,tsx}"],
          name: "node",
        },
      },
      {
        extends: true,
        test: {
          environment: "jsdom",
          include: ["src/**/*.component.test.{ts,tsx}"],
          name: "component",
        },
      },
    ],
    setupFiles: ["src/platform/testing/setup.ts"],
  },
}))
