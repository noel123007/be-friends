import { AppError } from "../common/errors/AppError";
import { IProfile } from "../models/Profile";
import {
    updateProfileSchema,
    uploadImageSchema,
    type UpdateProfileInput,
    type UploadImageInput,
} from "../schema/validation/profile";
import { uploadService } from "../services/upload";
import { Context } from "../types";
import { ActivityType, FriendStatus, NotificationType } from "../types/enums";
import { logger } from "../util/logger";
import { sendNotification } from '../util/notification';
import { validate } from "../util/validate";

type UpdateField = "avatar" | "coverImage";

interface PopulatedProfile extends IProfile {
    stats?: {
        friendsCount: number;
        activitiesCount: number;
        postsCount: number;
    };
}

export const profileResolvers = {
    Query: {
        profile: async (
            _: unknown,
            { userId }: { userId?: string },
            { models, user }: Context
        ) => {
            if (!user) throw AppError.unauthorized();

            try {
                const targetUserId = userId || user.id;
                const profile = await models.Profile.findOne({
                   $or: [{userId: targetUserId}, {_id: targetUserId}]
                }).lean<PopulatedProfile>();

                if (!profile) {
                    throw AppError.notFound("Profile not found");
                }

                // Get profile stats
                const [friendsCount, activitiesCount] = await Promise.all([
                    models.Friend.countDocuments({
                        $or: [
                            { senderId: targetUserId, status: FriendStatus.FRIENDS },
                            { receiverId: targetUserId, status: FriendStatus.FRIENDS }
                        ]
                    }),
                    models.Activity.countDocuments({ userId: targetUserId }),
                ]);

                return {
                    id: profile._id.toString(),
                    userId: profile.userId.toString(),
                    name: profile.name,
                    bio: profile.bio || "",
                    location: profile.location || "",
                    website: profile.website || "",
                    avatar: profile.avatar || "",
                    coverImage: profile.coverImage || "",
                    socialLinks: {
                        twitter: profile.socialLinks?.twitter || "",
                        github: profile.socialLinks?.github || "",
                        linkedin: profile.socialLinks?.linkedin || ""
                    },
                    stats: {
                        friendsCount,
                        activitiesCount,
                        postsCount: 0, // Reserved for future implementation
                    },
                    createdAt: profile.createdAt.toISOString(),
                    updatedAt: profile.updatedAt.toISOString()
                };
            } catch (error) {
                logger.error("Fetch profile error:", error);
                throw error;
            }
        },
    },

    Mutation: {
        updateProfile: async (
            _: unknown,
            { input }: { input: UpdateProfileInput },
            { models, user, pubsub }: Context
        ) => {
            if (!user) throw AppError.unauthorized();

            try {
                const validatedInput = await validate(updateProfileSchema, input);

                const profile = await models.Profile.findOneAndUpdate(
                    { userId: user.id },
                    { $set: validatedInput },
                    { new: true }
                ).lean<IProfile>();

                if (!profile) {
                    throw AppError.notFound("Profile not found");
                }

                const formattedProfile = {
                    id: profile._id.toString(),
                    userId: profile.userId.toString(),
                    name: profile.name,
                    bio: profile.bio || "",
                    location: profile.location || "",
                    website: profile.website || "",
                    avatar: profile.avatar || "",
                    coverImage: profile.coverImage || "",
                    socialLinks: {
                        twitter: profile.socialLinks?.twitter || "",
                        github: profile.socialLinks?.github || "",
                        linkedin: profile.socialLinks?.linkedin || ""
                    },
                    createdAt: profile.createdAt.toISOString(),
                    updatedAt: profile.updatedAt.toISOString()
                };

                await models.Activity.create({
                    userId: user.id,
                    type: ActivityType.PROFILE_UPDATE,
                    message: "updated their profile"
                });

                pubsub.publish(`PROFILE_UPDATED_${user.id}`, {
                    profileUpdated: formattedProfile
                });

                // Send profile update notification
                await sendNotification({
                    userId: user.id,
                    type: NotificationType.SYSTEM,
                    title: 'Profile Updated',
                    message: 'Your profile has been successfully updated.',
                    data: { userId: user.id }
                }, { models, pubsub })

                return formattedProfile;
            } catch (error) {
                logger.error("Update profile error:", error);
                throw error;
            }
        },

        uploadProfileImage: async (
            _: unknown,
            { input }: { input: UploadImageInput },
            { models, user, pubsub }: Context
        ) => {
            if (!user) throw AppError.unauthorized();

            try {
                const validatedInput = await validate(uploadImageSchema, input);
                const { file, type } = validatedInput;

                 // Ensure file is resolved if it's a promise
                const resolvedFile = await Promise.resolve(file)
                
                if (!resolvedFile) {
                throw AppError.badRequest("No file provided")
                }

                const uploadResult = await uploadService.uploadFile(resolvedFile);
                const updateField: UpdateField = type === "AVATAR" ? "avatar" : "coverImage";

                // Delete old file if exists
                const oldProfile = await models.Profile.findOne({ userId: user.id }).lean<IProfile>();
                if (oldProfile && oldProfile[updateField]) {
                    const oldFilename = oldProfile[updateField]?.split("/").pop();
                    if (oldFilename) {
                        await uploadService.deleteFile(oldFilename);
                    }
                }

                const profile = await models.Profile.findOneAndUpdate(
                    { userId: user.id },
                    { $set: { [updateField]: uploadResult.url } },
                    { new: true }
                ).lean<IProfile>();

                if (!profile) {
                    throw AppError.notFound("Profile not found");
                }

                 // Format the response to match GraphQL schema
                 const formattedProfile = {
                    id: profile._id.toString(),
                    userId: profile.userId.toString(),
                    name: profile.name,
                    bio: profile.bio || "",
                    location: profile.location || "",
                    website: profile.website || "",
                    avatar: profile.avatar || "",
                    coverImage: profile.coverImage || "",
                    socialLinks: {
                        twitter: profile.socialLinks?.twitter || "",
                        github: profile.socialLinks?.github || "",
                        linkedin: profile.socialLinks?.linkedin || ""
                    },
                    createdAt: profile.createdAt.toISOString(),
                    updatedAt: profile.updatedAt.toISOString()
                }

                await models.Activity.create({
                    userId: user.id,
                    type: ActivityType.PROFILE_UPDATE,
                    message: `updated ${type.toLowerCase()} image`,
                });

                pubsub.publish(`PROFILE_UPDATED_${user.id}`, {
                    profileUpdated: formattedProfile,
                });

                // Send profile image update notification
                await sendNotification({
                    userId: user.id,
                    type: NotificationType.SYSTEM,
                    title: 'Profile Image Updated',
                    message: `Your ${type.toLowerCase()} has been successfully updated.`,
                    data: { userId: user.id }
                }, { models, pubsub })

                return formattedProfile;
            } catch (error) {
                logger.error("Upload profile image error:", error);
                throw error;
            }
        },
    },

    Subscription: {
        profileUpdated: {
            subscribe: (
                _: unknown,
                { userId }: { userId: string },
                { pubsub }: Context
            ) => pubsub.asyncIterator([`PROFILE_UPDATED_${userId}`]),
        },
    },

    Profile: {
        user: async (parent: any, _: unknown, { models }: Context) => {
            try {
                return await models.User.findById(parent.userId).select("-password");
            } catch (error) {
                logger.error("Fetch profile user error:", error);
                throw error;
            }
        },
    },
};
