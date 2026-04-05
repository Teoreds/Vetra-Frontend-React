import { useNavigate } from "react-router-dom";
import { useNavHistoryStore } from "./use-nav-history";

/**
 * Returns a goBack(fallback) function.
 * If the nav history has at least 2 entries, navigates to the previous page
 * and pops both entries from the stack (the tracker will re-add the destination).
 * Otherwise navigates to the fallback path.
 */
export function useBack() {
  const navigate = useNavigate();
  const stack = useNavHistoryStore((s) => s.stack);

  return (fallback: string) => {
    if (stack.length >= 2) {
      const destination = stack[stack.length - 2];
      useNavHistoryStore.setState({ stack: stack.slice(0, -2) });
      navigate(destination);
    } else {
      navigate(fallback);
    }
  };
}
