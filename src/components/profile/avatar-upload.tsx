import { useState, useRef, type ChangeEvent } from "react";
import { useUpdateAvatar, useRemoveAvatar } from "../../hooks/useProfile";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";

interface AvatarUploadProps {
  avatarUrl: string | null;
  username: string;
  displayName: string | null;
}

export function AvatarUpload({
  avatarUrl,
  username,
  displayName,
}: AvatarUploadProps) {
  const updateAvatar = useUpdateAvatar();
  const removeAvatar = useRemoveAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState("");

  const hasPreview = previewFile != null;

  // The displayed image: pending preview > saved avatar > nothing (shows initials)
  const displayUrl = previewUrl ?? avatarUrl;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError("");

    if (!file) {
      clearPreview();
      return;
    }

    // Client-side validation
    const allowed: string[] = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setValidationError("Please select a PNG, JPEG, WebP, or GIF image.");
      clearPreview();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setValidationError(`File is ${sizeMB} MB. Maximum size is 5 MB.`);
      clearPreview();
      return;
    }

    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = () => {
    if (!previewFile) return;
    setValidationError("");

    updateAvatar.mutate(previewFile, {
      onSuccess: () => clearPreview(),
    });
  };

  const handleCancel = () => {
    clearPreview();
    setValidationError("");
  };

  const handleRemove = () => {
    setValidationError("");
    removeAvatar.mutate();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-5">
      {/* Avatar display */}
      <div className="relative shrink-0">
        <Avatar
          avatarUrl={displayUrl}
          username={username}
          size="lg"
        />

        {/* Pending upload spinner overlay */}
        {updateAvatar.isPending && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <svg
              className="animate-spin h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Uploading…"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 min-w-0">
        {/* User identity */}
        <p className="font-bold text-neutral-900 truncate">
          {displayName ?? username}
        </p>
        <p className="text-sm text-neutral-500 mb-3">@{username}</p>

        {/* Validation / mutation error */}
        {validationError && (
          <p className="text-sm text-red-600 mb-2" role="alert">
            {validationError}
          </p>
        )}
        {updateAvatar.isError && updateAvatar.error instanceof Error && (
          <p className="text-sm text-red-600 mb-2" role="alert">
            {updateAvatar.error.message}
          </p>
        )}
        {removeAvatar.isError && removeAvatar.error instanceof Error && (
          <p className="text-sm text-red-600 mb-2" role="alert">
            {removeAvatar.error.message}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasPreview ? (
            <>
              <Button
                size="sm"
                onClick={handleUpload}
                loading={updateAvatar.isPending}
              >
                {updateAvatar.isPending ? "Uploading…" : "Save Photo"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={updateAvatar.isPending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={removeAvatar.isPending}
              >
                {avatarUrl ? "Change Photo" : "Add Photo"}
              </Button>
              {avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  loading={removeAvatar.isPending}
                  disabled={updateAvatar.isPending}
                >
                  Remove
                </Button>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-neutral-400 mt-2">
          PNG, JPEG, WebP, or GIF · Max 5 MB
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Choose a profile photo"
        />
      </div>
    </div>
  );
}
