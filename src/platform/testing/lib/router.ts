import { createMemoryHistory, createRootRoute, createRouter } from "@tanstack/react-router"

import { LOCALE_REWRITE } from "~/src/integrations/use-intl/i18n.utils"

export const createTestRouter = (path = "/") =>
  createRouter({ history: createMemoryHistory({ initialEntries: [path] }), rewrite: LOCALE_REWRITE, routeTree: createRootRoute() })
