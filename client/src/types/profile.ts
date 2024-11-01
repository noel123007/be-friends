export interface Profile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  coverImage: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  stats: {
    friendsCount: number;
    postsCount: number;
    activitiesCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface UploadImageInput {
  file: File;
  type: 'avatar' | 'cover';
}
