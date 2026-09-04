// Build-time state shared with the templates. build.js populates this before
// any page is rendered, so shared chrome (footer, nav) only ever links to
// pages that actually exist.
export const state = {
  liveCategories: [],
};
