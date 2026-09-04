// Build-time state shared with the templates. build.js populates this before
// any page is rendered, so shared chrome (footer, nav, search placeholder)
// always reflects what was actually built.
export const state = {
  liveCategories: [],
  toolCount: 0,
};
