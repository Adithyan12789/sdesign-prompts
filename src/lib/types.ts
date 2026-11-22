export type ResourceType = 'prompt' | 'guide' | 'workflow' | 'bundle';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Access = 'free' | 'premium';

export interface ResourceFile {
  id: string;
  label: string;
  kind: 'prompt-txt' | 'guide-pdf' | 'bundle-zip' | 'reference-image' | 'other';
  format: string; // TXT, PDF, ZIP, JPG...
  size: number; // bytes
  storageKey: string; // private storage key, never exposed as a URL
  originalName: string;
}

export interface InstructionStep { title: string; body: string; }

export interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  previewImages: string[];
  previewVideo?: string;
  category: string; // category slug
  type: ResourceType;
  platforms: string[]; // platform slugs
  difficulty: Difficulty;
  promptContent: string;
  instructions: InstructionStep[];
  files: ResourceFile[];
  access: Access;
  featured: boolean;
  status: 'draft' | 'published';
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  placeholder?: boolean;
}

export interface CategoryItem { id: string; name: string; slug: string; description: string; image: string; }
export interface PlatformItem { id: string; name: string; slug: string; url: string; }
export interface SessionUser { id: string; name: string; email: string; role: 'user' | 'admin'; }
export interface SiteContentData {
  heroEyebrow: string; heroTitle: string; heroSubtitle: string; heroImage: string;
  studioTitle: string; studioText: string; studioImage: string;
  footerText: string; instagram: string; youtube: string; x: string; linkedin: string;
}
