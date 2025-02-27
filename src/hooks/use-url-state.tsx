import React from "react";

import { useUrlParams, type UseUrlParamsProps } from "~/hooks/use-url-params";

export type UseUrlStateReturn<T> = [T, (value: Partial<T>) => void];

export function useUrlState<T extends Record<string, unknown>>(
  defaultValue: T,
  props?: UseUrlParamsProps,
): UseUrlStateReturn<T> {
  const [getParam, setParams] = useUrlParams<T>(props);

  const params = React.useMemo<T>(() => {
    const newValue: Record<string, unknown> = {};

    Object.keys(defaultValue).map((key) => {
      newValue[key] = getParam(key, defaultValue[key]);
    });

    return newValue as T;
  }, [defaultValue, getParam]);

  return [params, setParams];
}
