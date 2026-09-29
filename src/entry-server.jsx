import { renderToString } from "react-dom/server";
import App from "./FirstInternships.jsx";
export { sanitizePlanner, csvCell } from "./FirstInternships.jsx";
export { ROUTES, SITE, RENDERED_AT, VERIFIED, resolvePage, PROGRAMS, GUIDES, YEARS, FIELDS, featuredPrograms, programHeading, programPath, guidePath, yearPath, fieldPath, programsForField, programsForYear, programsForTopic } from "./content.js";
export function render(pathname) { return renderToString(<App pathname={pathname} />); }
