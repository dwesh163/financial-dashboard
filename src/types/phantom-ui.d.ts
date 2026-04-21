import type { PhantomUiAttributes } from "@aejkatappaja/phantom-ui";

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUiAttributes;
    }
  }
}
