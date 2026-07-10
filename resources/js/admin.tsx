import "../css/app.css";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { initializeTheme } from "@/hooks/use-appearance";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

initializeTheme();

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob("./pages/**/*.tsx"),
    ),
  setup({ el, App, props }) {
    createRoot(el).render(
      // <AuthProvider>
      <App {...props} />,
      // </AuthProvider>,
    );
  },
});
