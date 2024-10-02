import { useCallback, useEffect, useReducer } from "react";
import { useIsMounted } from "./useIsMounted";

/* GitHub Repository - Exercise */
export function fetchReducer(state, action) {
  switch (action.type) {
    case "pending": {
      // data et error null
      return { isLoaded: false, status: action.type, error: null, data: null };
    }
    case "resolved": {
      // data: action.data
      return {
        isLoaded: true,
        status: action.type,
        error: null,
        data: action.data,
      };
    }
    case "rejected": {
      // error: action.error
      return {
        isLoaded: false,
        status: action.type,
        error: action.error,
        data: null,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export const useFetch = (url, config = null) => {
  const [{ isLoaded, status, error, data }, dispatch] = useReducer(
    fetchReducer,
    {
      isLoaded: false,
      status: "idle",
      error: null,
      data: null,
    }
  );
  const isMounted = useIsMounted();

  const run = useCallback(() => {
    fetch(url, config || undefined)
      .then(async (response) => {
        const json = await response.json();

        if (!isMounted()) return;

        if (response.ok) {
          dispatch({ type: "resolved", data: json });
        } else {
          dispatch({ type: "rejected", error: json });
        }
      })
      .catch((error) => {
        if (error.body) {
          console.error("Error body:", error.body);
        }
        if (!isMounted()) return;

        dispatch({ type: "rejected", error });
      });
  }, [url]);

  useEffect(() => {
    run();
  }, [run]);

  return { isLoaded, status, error, data, run };
};
