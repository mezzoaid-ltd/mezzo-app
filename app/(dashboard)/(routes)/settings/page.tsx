import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-profile";
import { ProfileForm } from "./_components/profile-form";

const SettingsPage = async () => {
  const profile = await getCurrentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  // Cast profile to match our ProfileData interface
  const profileData = {
    id: profile.id,
    user_id: profile.user_id,
    name: profile.name,
    image_url: profile.image_url,
    email: profile.email,
    role: profile.role,
    bio: profile.bio || null,
    title: profile.title || null,
    headline: profile.headline || null,
    website_url: profile.website_url || null,
    social_links: profile.social_links || null,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your profile information and preferences
          </p>
        </div>

        <ProfileForm initialData={profileData} />
      </div>
    </div>
  );
};

export default SettingsPage;
