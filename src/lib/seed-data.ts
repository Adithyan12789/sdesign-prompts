import type { CategoryItem, PlatformItem, ResourceItem, SiteContentData } from './types';

/**
 * Placeholder library content.
 *
 * These resources exist so the library can be reviewed end to end before
 * real content is uploaded through the admin dashboard. Every prompt text
 * below is a generic EXAMPLE written for layout and workflow testing — it
 * is not presented as original studio content, and each resource is
 * flagged `placeholder: true` in the interface until replaced.
 */

const img = (id: string, w = 1600) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const SEED_CATEGORIES: CategoryItem[] = [
  { id: 'seed-cat-exterior', name: 'Exterior Architecture', slug: 'exterior-architecture', description: 'Facades, towers and street-level reveals of buildings in their urban context.', image: img('photo-1486406146926-c627a92ad1ab') },
  { id: 'seed-cat-interior', name: 'Interior Architecture', slug: 'interior-architecture', description: 'Interior pans, room reveals and material-focused interior sequences.', image: img('photo-1618221195710-dd6b41faaea6') },
  { id: 'seed-cat-transformation', name: 'Building Transformation', slug: 'building-transformation', description: 'Before-and-after sequences: renovation, restoration and material change.', image: img('photo-1503387762-592deb58ef4e') },
  { id: 'seed-cat-timelapse', name: 'Construction Timelapse', slug: 'construction-timelapse', description: 'Buildings rising frame by frame, from foundations to finished facade.', image: img('photo-1541888946425-d81bb19240f5') },
  { id: 'seed-cat-walkthrough', name: 'Architectural Walkthrough', slug: 'architectural-walkthrough', description: 'Continuous camera journeys through plans, courtyards and interiors.', image: img('photo-1600585154340-be6161a56a0c') },
  { id: 'seed-cat-landscape', name: 'Landscape Architecture', slug: 'landscape-architecture', description: 'Gardens, courtyards, terraces and the landscape around the building.', image: img('photo-1558904541-efa843a96f01') },
  { id: 'seed-cat-daynight', name: 'Day-to-Night Transformation', slug: 'day-to-night-transformation', description: 'A single scene carried from daylight through dusk into night.', image: img('photo-1479839672679-a46483c0e7c8') },
  { id: 'seed-cat-viz', name: 'Architectural Visualization', slug: 'architectural-visualization', description: 'Concept and competition visuals: massing, materials and atmosphere studies.', image: img('photo-1487958449943-2429e8be8625') },
  { id: 'seed-cat-cinematic', name: 'Cinematic Architectural Videos', slug: 'cinematic-architectural-videos', description: 'Film-language architecture: slow reveals, aerial arcs and dramatic light.', image: img('photo-1449157291145-7efd050a4d0e') },
];

export const SEED_PLATFORMS: PlatformItem[] = [
  { id: 'seed-pf-runway', name: 'Runway', slug: 'runway', url: 'https://runwayml.com' },
  { id: 'seed-pf-kling', name: 'Kling AI', slug: 'kling', url: 'https://klingai.com' },
  { id: 'seed-pf-luma', name: 'Luma Dream Machine', slug: 'luma', url: 'https://lumalabs.ai' },
  { id: 'seed-pf-pika', name: 'Pika', slug: 'pika', url: 'https://pika.art' },
  { id: 'seed-pf-veo', name: 'Google Veo', slug: 'veo', url: 'https://deepmind.google/technologies/veo' },
  { id: 'seed-pf-sora', name: 'Sora', slug: 'sora', url: 'https://openai.com/sora' },
  { id: 'seed-pf-hailuo', name: 'Hailuo (MiniMax)', slug: 'hailuo', url: 'https://hailuoai.video' },
];

const steps = (arr: [string, string][]) => arr.map(([title, body]) => ({ title, body }));
const filesFor = (slug: string, title: string, access: 'free' | 'premium') => ([
  { id: `${slug}-txt`, label: 'Prompt file', kind: 'prompt-txt' as const, format: 'TXT', size: 0, storageKey: `sample-${slug}-prompt.txt`, originalName: `${slug}-prompt.txt` },
  { id: `${slug}-pdf`, label: 'Step-by-step guide', kind: 'guide-pdf' as const, format: 'PDF', size: 0, storageKey: `sample-${slug}-guide.pdf`, originalName: `${slug}-guide.pdf` },
  { id: `${slug}-zip`, label: 'Complete resource bundle', kind: 'bundle-zip' as const, format: 'ZIP', size: 0, storageKey: `sample-${slug}-bundle.zip`, originalName: `${slug}-bundle.zip` },
]);

const R = (r: Partial<ResourceItem> & Pick<ResourceItem, 'title' | 'slug' | 'category' | 'type'>): ResourceItem => ({
  id: `seed-${r.slug}`, shortDescription: '', description: '', thumbnail: '', previewImages: [],
  platforms: [], difficulty: 'Beginner', promptContent: '', instructions: [], files: filesFor(r.slug, r.title, r.access ?? 'free'),
  access: 'free', featured: false, status: 'published', downloads: 0, views: 0,
  createdAt: '2026-11-01T09:00:00.000Z', updatedAt: '2026-11-01T09:00:00.000Z', placeholder: true, ...r,
} as ResourceItem);

export const SEED_RESOURCES: ResourceItem[] = [
  R({
    title: 'Glass Tower Reveal — Placeholder Example', slug: 'glass-tower-reveal',
    category: 'exterior-architecture', type: 'prompt', platforms: ['runway', 'kling'], difficulty: 'Beginner',
    featured: true, downloads: 412, views: 2980, createdAt: '2026-11-18T09:00:00.000Z', updatedAt: '2026-11-18T09:00:00.000Z',
    thumbnail: img('photo-1486406146926-c627a92ad1ab'), previewImages: [img('photo-1486406146926-c627a92ad1ab'), img('photo-1449157291145-7efd050a4d0e')],
    shortDescription: 'Example placeholder prompt: a slow rising reveal of a glass office tower at morning light.',
    description: 'Placeholder resource used to demonstrate the library layout, prompt viewer and download flow. Replace this text, the prompt and the attached files with the real guide through the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nSlow cinematic camera rise along a glass office tower facade, morning light, reflections moving across the curtain wall, city street below waking up, photorealistic architectural video, steady motion, no people close to camera.',
    instructions: steps([
      ['Prepare the still', 'Start from a clean, high-resolution exterior photograph with the full tower in frame and no motion blur.'],
      ['Paste the prompt', 'Copy the prompt into your video platform and set the duration to 8–10 seconds for a controlled rise.'],
      ['Direct the motion', 'Keep camera motion to a single axis. If the model adds a pan, reduce motion strength and regenerate.'],
      ['Finish', 'Trim the first and last half-second, where AI video artefacts are most common.'],
    ]),
  }),
  R({
    title: 'Courtyard House Walkthrough — Placeholder Guide', slug: 'courtyard-house-walkthrough',
    category: 'architectural-walkthrough', type: 'guide', platforms: ['luma'], difficulty: 'Intermediate',
    featured: true, downloads: 356, views: 2411, createdAt: '2026-11-15T09:00:00.000Z', updatedAt: '2026-11-15T09:00:00.000Z',
    thumbnail: img('photo-1600585154340-be6161a56a0c'), previewImages: [img('photo-1600585154340-be6161a56a0c'), img('photo-1600607687939-ce8a6c25118c')],
    shortDescription: 'Example placeholder guide: a continuous walkthrough from street gate to inner courtyard.',
    description: 'Placeholder resource demonstrating the guide format with step-by-step instructions. Replace with the real walkthrough workflow via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nContinuous forward walkthrough through a house entrance into a sunlit inner courtyard, smooth steady camera at eye level, warm afternoon light, architectural photography style, no cuts.',
    instructions: steps([
      ['Plan the path', 'Sketch the camera path first: gate, passage, courtyard. One continuous move, no turns sharper than 45 degrees.'],
      ['Generate in segments', 'Produce three short clips (approach, passage, courtyard) with matching light direction, then join them on the cut points.'],
      ['Match the light', 'Keep the sun position consistent across segments; mismatched shadows are the most visible join artefact.'],
      ['Stabilise and grade', 'Apply light stabilisation and a single warm grade across all segments so they read as one shot.'],
    ]),
  }),
  R({
    title: 'Facade Transformation: Old to New — Placeholder Workflow', slug: 'facade-transformation-old-to-new',
    category: 'building-transformation', type: 'workflow', platforms: ['kling'], difficulty: 'Advanced',
    access: 'premium', featured: true, downloads: 289, views: 1975, createdAt: '2026-11-12T09:00:00.000Z', updatedAt: '2026-11-12T09:00:00.000Z',
    thumbnail: img('photo-1503387762-592deb58ef4e'), previewImages: [img('photo-1503387762-592deb58ef4e')],
    shortDescription: 'Example placeholder workflow: morph a weathered facade into its renovated state in one shot.',
    description: 'Placeholder premium resource demonstrating access control on downloads. Replace with the real transformation workflow via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nLocked-off camera on a weathered brick facade; the surface gradually restores itself — mortar repoints, windows clear, stone cleans — ending as a fully renovated facade in the same light, photorealistic, no camera movement.',
    instructions: steps([
      ['Align the pair', 'Prepare matched before/after stills from the identical viewpoint; alignment matters more than resolution.'],
      ['Use first/last frame control', 'Set the weathered image as the first frame and the renovated image as the last frame where the platform supports it.'],
      ['Control the transition', 'Ask for a gradual, even transformation. Localised morphing usually means the stills are misaligned.'],
      ['Clean the edges', 'Mask and re-composite window reflections in an editor if the model warps them.'],
    ]),
  }),
  R({
    title: 'Construction Timelapse from a Single Photo — Placeholder', slug: 'construction-timelapse-single-photo',
    category: 'construction-timelapse', type: 'prompt', platforms: ['pika'], difficulty: 'Intermediate',
    downloads: 198, views: 1204, createdAt: '2026-11-10T09:00:00.000Z', updatedAt: '2026-11-10T09:00:00.000Z',
    thumbnail: img('photo-1541888946425-d81bb19240f5'), previewImages: [img('photo-1541888946425-d81bb19240f5')],
    shortDescription: 'Example placeholder prompt: a building rising in timelapse from one site photograph.',
    description: 'Placeholder resource demonstrating the prompt format for timelapse work. Replace with real content via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nConstruction timelapse from a fixed viewpoint: foundations, frame rising floor by floor, crane moving, facade panels installed, ending with the completed building, fast clouds, changing daylight, photorealistic.',
    instructions: steps([
      ['Choose the viewpoint', 'Use a wide, elevated site photo with room above the finished building height.'],
      ['Prompt the sequence', 'List the construction stages in order; models follow listed sequences more reliably than single sentences.'],
      ['Extend in passes', 'Generate the first stage, then extend from the last frame for each following stage.'],
    ]),
  }),
  R({
    title: 'Day-to-Night Facade Transition — Placeholder', slug: 'day-to-night-facade-transition',
    category: 'day-to-night-transformation', type: 'prompt', platforms: ['runway'], difficulty: 'Beginner',
    downloads: 264, views: 1688, createdAt: '2026-11-08T09:00:00.000Z', updatedAt: '2026-11-08T09:00:00.000Z',
    thumbnail: img('photo-1479839672679-a46483c0e7c8'), previewImages: [img('photo-1479839672679-a46483c0e7c8')],
    shortDescription: 'Example placeholder prompt: carry one facade from noon through dusk to lit night.',
    description: 'Placeholder resource demonstrating day-to-night prompt structure. Replace with real content via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nStatic camera on a residential facade as daylight fades through golden hour into blue dusk; windows light up one by one, warm interior glow, deep blue sky, photorealistic timelapse feel.',
    instructions: steps([
      ['Lock the camera', 'Any camera drift breaks the day-to-night illusion; prompt for a static shot explicitly.'],
      ['Sequence the light', 'Name the phases in order — noon, golden hour, dusk, night — so the transition stays even.'],
      ['Windows last', 'Ask for windows to light near the end; early window light is the most common failure.'],
    ]),
  }),
  R({
    title: 'Minimal Interior Pan — Placeholder', slug: 'minimal-interior-pan',
    category: 'interior-architecture', type: 'prompt', platforms: ['luma', 'veo'], difficulty: 'Beginner',
    downloads: 231, views: 1430, createdAt: '2026-11-06T09:00:00.000Z', updatedAt: '2026-11-06T09:00:00.000Z',
    thumbnail: img('photo-1618221195710-dd6b41faaea6'), previewImages: [img('photo-1618221195710-dd6b41faaea6'), img('photo-1616486338812-3dadae4b4ace')],
    shortDescription: 'Example placeholder prompt: a slow pan across a calm, minimal living space.',
    description: 'Placeholder resource demonstrating interior prompt structure. Replace with real content via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nSlow horizontal pan across a minimal living room, soft daylight from large windows, linen and oak textures, gentle shadows moving, calm architectural interior photography, no people.',
    instructions: steps([
      ['Declutter the still', 'Interior models amplify clutter; start from the cleanest composition you have.'],
      ['One motion only', 'A pan or a push-in — never both. Combined moves are where interiors warp.'],
      ['Protect straight lines', 'If door frames bend, lower the motion amount before changing the prompt.'],
    ]),
  }),
  R({
    title: 'Landscape Courtyard Flyover — Placeholder Guide', slug: 'landscape-courtyard-flyover',
    category: 'landscape-architecture', type: 'guide', platforms: ['veo'], difficulty: 'Intermediate',
    access: 'premium', downloads: 142, views: 986, createdAt: '2026-11-04T09:00:00.000Z', updatedAt: '2026-11-04T09:00:00.000Z',
    thumbnail: img('photo-1558904541-efa843a96f01'), previewImages: [img('photo-1558904541-efa843a96f01')],
    shortDescription: 'Example placeholder guide: a low aerial pass over a planted courtyard.',
    description: 'Placeholder premium guide demonstrating the format. Replace with real content via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nLow aerial flyover across a planted courtyard garden toward a stone pavilion, morning mist in the planting beds, slow steady drone movement, cinematic architectural landscape.',
    instructions: steps([
      ['Set the altitude in words', 'Say "low aerial, just above the planting" — models interpret height from language, not numbers.'],
      ['Give the camera a destination', 'Name the building the move ends on; open-ended flyovers drift.'],
      ['Watch the foliage', 'Planting is the first thing to shimmer; reduce saturation slightly in the grade to hide it.'],
    ]),
  }),
  R({
    title: 'Cinematic Museum Atrium — Placeholder Bundle', slug: 'cinematic-museum-atrium',
    category: 'cinematic-architectural-videos', type: 'bundle', platforms: ['sora', 'runway'], difficulty: 'Advanced',
    access: 'premium', featured: true, downloads: 317, views: 2210, createdAt: '2026-11-02T09:00:00.000Z', updatedAt: '2026-11-02T09:00:00.000Z',
    thumbnail: img('photo-1449157291145-7efd050a4d0e'), previewImages: [img('photo-1449157291145-7efd050a4d0e'), img('photo-1487958449943-2429e8be8625')],
    shortDescription: 'Example placeholder bundle: atrium reveal, light study and visitor-scale shots for one space.',
    description: 'Placeholder premium bundle demonstrating multi-file resources (prompt file, guide PDF and ZIP bundle). Replace with the real bundle via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nGrand museum atrium, camera arcs slowly from the entrance toward a sweeping staircase as a shaft of sunlight moves across the stone floor, visitors as soft distant silhouettes, cinematic architectural film.',
    instructions: steps([
      ['Build the shot list', 'Three shots: wide reveal, light study, human scale. Generate them in that order so light direction matches.'],
      ['Keep people distant', 'Close figures break realism; keep visitors as background silhouettes.'],
      ['Grade as one film', 'One LUT across all three shots sells the single-location illusion.'],
    ]),
  }),
  R({
    title: 'Parametric Tower Visualization — Placeholder Workflow', slug: 'parametric-tower-visualization',
    category: 'architectural-visualization', type: 'workflow', platforms: ['kling', 'hailuo'], difficulty: 'Intermediate',
    downloads: 176, views: 1102, createdAt: '2026-10-30T09:00:00.000Z', updatedAt: '2026-10-30T09:00:00.000Z',
    thumbnail: img('photo-1487958449943-2429e8be8625'), previewImages: [img('photo-1487958449943-2429e8be8625')],
    shortDescription: 'Example placeholder workflow: orbit a twisting parametric tower concept visual.',
    description: 'Placeholder resource demonstrating visualization workflows. Replace with real content via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nSlow orbital camera move around a twisting parametric tower concept model, white facade panels with soft shadows, neutral studio sky, architectural visualization style, clean and minimal.',
    instructions: steps([
      ['Export a clean still', 'Render the concept model against a plain sky; busy backgrounds fight the orbit.'],
      ['Limit the arc', 'Ask for a quarter orbit at most per generation, then chain from the last frame.'],
      ['Fix panel shimmer', 'A slight blur pass on the facade in post hides panel flicker without softening the silhouette.'],
    ]),
  }),
  R({
    title: 'Heritage Renovation Reveal — Placeholder Guide', slug: 'heritage-renovation-reveal',
    category: 'building-transformation', type: 'guide', platforms: ['runway'], difficulty: 'Intermediate',
    downloads: 154, views: 940, createdAt: '2026-10-28T09:00:00.000Z', updatedAt: '2026-10-28T09:00:00.000Z',
    thumbnail: img('photo-1503387762-592deb58ef4e'), previewImages: [img('photo-1503387762-592deb58ef4e')],
    shortDescription: 'Example placeholder guide: reveal a restored heritage interior from its derelict state.',
    description: 'Placeholder resource demonstrating the guide format for renovation work. Replace with real content via the admin dashboard.',
    promptContent: '[EXAMPLE PROMPT — placeholder]\nInterior of a derelict heritage hall gradually restoring: plaster repairs, timber beams return, tall windows clear, warm light returns, locked camera, photorealistic renovation reveal.',
    instructions: steps([
      ['Respect the fabric', 'List the elements that must survive unchanged — models love to "improve" heritage details away.'],
      ['Restore in order', 'Structure first, surfaces second, light last; the sequence reads as real renovation.'],
      ['Compare against the survey', 'Check the final frame against survey photos before publishing the sequence.'],
    ]),
  }),
];

export const SEED_CONTENT: SiteContentData = {
  heroEyebrow: 'The Architectural AI Video Library',
  heroTitle: 'Prompts & guides for architectural film',
  heroSubtitle: 'A curated library of AI video prompts, step-by-step guides and downloadable resource bundles for architects and visualization artists.',
  heroImage: img('photo-1486406146926-c627a92ad1ab', 2400),
  studioTitle: 'A working library, not a gallery',
  studioText: 'Every resource in this library is a complete working package: the prompt itself, a step-by-step guide, reference imagery and downloadable files, organised by category, platform and difficulty so you can find the right starting point in seconds.',
  studioImage: img('photo-1497366216548-37526070297c', 1600),
  footerText: 'A premium resource library for AI architectural video creation.',
  instagram: 'https://instagram.com', youtube: 'https://youtube.com', x: 'https://x.com', linkedin: 'https://linkedin.com',
};
