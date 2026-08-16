// All content here comes from /content/**/*.json — files that Decap CMS
// reads and writes directly. Editing something in the CMS and publishing
// commits a change to one of these files, which triggers a Netlify rebuild.

const siteModule = import.meta.glob('../../content/site.json', { eager: true });
const aboutModule = import.meta.glob('../../content/about.json', { eager: true });
const projectModules = import.meta.glob('../../content/projects/*.json', { eager: true });
const categoryModules = import.meta.glob('../../content/categories/*.json', { eager: true });
const motionCategoryModules = import.meta.glob('../../content/motion-categories/*.json', { eager: true });
const testimonialModules = import.meta.glob('../../content/testimonials/*.json', { eager: true });
const teamModules = import.meta.glob('../../content/team/*.json', { eager: true });

const unwrap = (mod) => mod.default ?? mod;

export const SITE = unwrap(Object.values(siteModule)[0]);
export const ABOUT_CMS = unwrap(Object.values(aboutModule)[0]);

export const PROJECTS = Object.values(projectModules)
  .map(unwrap)
  .map((p, i) => ({ id: p.id || `project-${i}`, ...p }));

// The list of project category names/order lives entirely in the CMS now —
// editing, adding, or removing an entry under "Project Categories" updates
// the Work page filter tabs and the Category picker on projects, no code
// changes needed.
export const CATEGORIES = Object.values(categoryModules)
  .map(unwrap)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const MOTION_PROJECTS = Object.values(motionCategoryModules)
  .map(unwrap)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .reduce((acc, cat) => {
    acc[cat.subcategory] = (cat.videos || []).map((v, i) => ({ id: `${cat.subcategory}-${i}`, ...v }));
    return acc;
  }, {});

export const TESTIMONIALS = Object.values(testimonialModules).map(unwrap);

export const TEAM = Object.values(teamModules)
  .map((mod, i) => ({ id: `team-${i}`, ...unwrap(mod) }))
  .filter(member => member.visible !== false);

// --- Media resolution helpers ---
// CMS video fields store either a directly-uploaded file (video_upload) or a
// pasted link (video_url) — whichever is filled in wins. Everything downstream
// still just gets a plain { url, type? } object, same as before.
export const resolveVideo = (v) => {
  if (!v) return null;
  const url = v.video_upload || v.video_url;
  if (!url) return null;
  return { ...v, url };
};

export const resolveHeroMedia = (hero) => {
  if (!hero) return null;
  if (hero.media_type === 'image' && hero.media_image) {
    return { type: 'image', url: hero.media_image };
  }
  const url = hero.media_video_upload || hero.media_video_url;
  return url ? { url } : null;
};
