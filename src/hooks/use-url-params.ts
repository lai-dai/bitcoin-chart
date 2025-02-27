/* eslint-disable no-restricted-syntax */
import React from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { parse, stringify } from "qs";

export const PARAM_RESET = undefined;

export type UseUrlParamsReturn<T> = [
  <R>(name: keyof T, defaultValue: R) => R,
  (value: unknown, name?: keyof T) => void,
  () => void,
];

export type UseUrlParamsProps = {
  onBeforeSet?: <T>(newParams: T) => T;
  method?: "push" | "replace";
};

export function useUrlParams<T extends Record<string, unknown>>(
  props: UseUrlParamsProps = {},
): UseUrlParamsReturn<T> {
  const { onBeforeSet, method = "push" } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  return React.useMemo<UseUrlParamsReturn<T>>(
    () => [
      <R>(name: keyof T, defaultValue: R) => {
        if (typeof name === "string" || typeof name === "number") {
          const get = (key: keyof T) => {
            const prevParamsStr = searchParams.toString();

            if (prevParamsStr) {
              const prevParams = parse(prevParamsStr) as T;
              return prevParams[key] ?? defaultValue;
            }

            return defaultValue;
          };

          const newValue = get(name);

          if (typeof defaultValue === "number") {
            return Number(newValue) as R;
          }

          return newValue as R;
        }
        return defaultValue;
      },

      (nextValue: unknown, name?: keyof T) => {
        let newParams;
        let newParamsStr;
        const prevParamsStr = searchParams.toString();
        const prevParams = parse(prevParamsStr);

        if (name) {
          newParams = {
            ...prevParams,
            [name]: nextValue,
          };
        } else if (nextValue instanceof Object) {
          newParams = {
            ...prevParams,
            ...nextValue,
          };
        }

        if (onBeforeSet instanceof Function) {
          newParams = onBeforeSet(newParams);
        }

        if (newParams) {
          newParamsStr = stringify(newParams, {
            encodeValuesOnly: true, // prettify URL
          });
        }

        router[method](`?${newParamsStr}`);
      },

      () => {
        router[method]("?");
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, searchParams, props],
  );
}
