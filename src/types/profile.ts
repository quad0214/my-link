export type ThemePreference = "light" | "dark" | "system";

export type Profile = {
  id: string;
  username: string;
  displayname: string;
  bio: string;
  avatarUrl: string | null;
  email?: string | null;
};

export type SectionBlock = {
  id: string;
  type: "section";
  title: string;
  visible: boolean;
  sortOrder: number;
};

export type LinkIcon = "instagram" | "youtube" | "globe" | "github";

export type LinkBlock = {
  id: string;
  type: "link";
  title: string;
  description: string;
  url: string;
  icon: LinkIcon;
  visible: boolean;
  sortOrder: number;
};

export type ContentBlock = SectionBlock | LinkBlock;

export type ProfileLinksResponse = {
  success: true;
  data: {
    profile: Profile;
    blocks: ContentBlock[];
    updatedAt: string;
  };
  meta: {
    apiVersion: "v1";
    resource: string;
    blockCount: number;
  };
};
