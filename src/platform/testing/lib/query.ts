import { MutationObserver, type MutationOptions, QueryClient } from "@tanstack/react-query"

export const executeMutation = <TData, TVariables>(
  options: MutationOptions<TData, Error, TVariables>,
  variables: TVariables,
): Promise<TData> => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return new MutationObserver(client, options).mutate(variables)
}
