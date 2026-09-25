import NotFound, { metadata } from "@/app/not-found";

/**
 * The not-found boundary for a product slug that does not exist.
 *
 * Every other dynamic route lists its slugs at build time and sets
 * `dynamicParams = false`, so an unknown slug never reaches the page: the
 * router renders the root not-found route, layouts and all. This route cannot
 * — its products come from the database per request — so an unknown slug
 * throws `notFound()` from inside the render. With no boundary below the root
 * layout, Next answers that with `<html id="__next_error__">`: a 404, but an
 * empty document that draws the not-found page only after hydration, which
 * with JavaScript off is a blank screen (SC 3.1.1, and
 * tests/e2e/not-found.spec.ts). A boundary here catches the throw inside the
 * layouts, and because it happens before anything has been streamed the
 * response is still a 404. The markup is the root page's, re-exported, so
 * there is one 404 and not two drifting apart.
 */
export { metadata };
export default NotFound;
