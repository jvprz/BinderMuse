"use client";

import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  userId: string;
  initialProfile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function ProfileForm({
  userId,
  initialProfile,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(
    initialProfile?.display_name ?? "",
  );
  const [username, setUsername] = useState(
    initialProfile?.username ?? "",
  );
  const [bio, setBio] = useState(
    initialProfile?.bio ?? "",
  );
  const [avatarUrl, setAvatarUrl] = useState(
    initialProfile?.avatar_url ?? null,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] =
    useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setSaved(false);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("Avatar must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);

    const supabase = createClient();

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${userId}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploadingAvatar(false);
      event.target.value = "";
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      );

    if (profileError) {
      setError(profileError.message);
      setIsUploadingAvatar(false);
      event.target.value = "";
      return;
    }

    setAvatarUrl(`${publicUrl}?v=${Date.now()}`);
    setIsUploadingAvatar(false);

    event.target.value = "";

    router.refresh();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    const cleanDisplayName = displayName.trim();
    const cleanBio = bio.trim();

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError(
        "Username can only contain letters, numbers, and underscores.",
      );
      return;
    }

    if (cleanDisplayName.length === 0) {
      setError("Display name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();

    const { error: saveError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          username: cleanUsername,
          display_name: cleanDisplayName,
          bio: cleanBio || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      );

    if (saveError) {
      if (saveError.code === "23505") {
        setError("That username is already taken.");
      } else {
        setError(saveError.message);
      }

      setIsSaving(false);
      return;
    }

    setUsername(cleanUsername);
    setDisplayName(cleanDisplayName);
    setBio(cleanBio);

    setSaved(true);
    setIsSaving(false);

    router.refresh();
  }

  const initials =
    displayName.trim().charAt(0).toUpperCase() ||
    username.trim().charAt(0).toUpperCase() ||
    "?";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-black/[0.04] text-xl font-semibold transition hover:opacity-80 disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06]"
          aria-label="Change avatar"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
            Change
          </span>
        </button>

        <div>
          <p className="font-medium">Profile picture</p>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            JPG, PNG or WebP. Maximum 5 MB.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="mt-2 text-sm font-medium transition hover:opacity-60 disabled:cursor-wait disabled:opacity-50"
          >
            {isUploadingAvatar
              ? "Uploading..."
              : avatarUrl
                ? "Change photo"
                : "Upload photo"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="displayName"
          className="mb-2 block text-sm font-medium"
        >
          Display name
        </label>

        <input
          id="displayName"
          name="displayName"
          type="text"
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
            setSaved(false);
          }}
          placeholder="Javier Pérez"
          maxLength={50}
          autoComplete="name"
          className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
        />
      </div>

      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium"
        >
          Username
        </label>

        <div className="flex items-center rounded-xl border border-black/10 transition focus-within:border-black/30 dark:border-white/10 dark:focus-within:border-white/30">
          <span className="pl-4 text-black/40 dark:text-white/40">
            @
          </span>

          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setSaved(false);
            }}
            placeholder="jvprz"
            minLength={3}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-1 py-3 pr-4 outline-none"
          />
        </div>

        <p className="mt-2 text-xs opacity-50">
          Letters, numbers and underscores only.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="bio"
            className="text-sm font-medium"
          >
            Bio
          </label>

          <span className="text-xs opacity-40">
            {bio.length}/160
          </span>
        </div>

        <textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={(event) => {
            setBio(event.target.value);
            setSaved(false);
          }}
          placeholder="Tell the BinderMuse community a little about yourself."
          maxLength={160}
          rows={4}
          className="w-full resize-none rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-red-500"
        >
          {error}
        </p>
      )}

      {saved && (
        <p
          role="status"
          className="text-sm text-emerald-600 dark:text-emerald-400"
        >
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving || isUploadingAvatar}
        className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isSaving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}