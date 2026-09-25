import { describe, it, expect, vi, beforeEach } from "vitest";
import { RETRO_AVATARS, getRetroAvatar } from "../utils/avatar";
import { updateUserProfile } from "../services/auth.service";
import { User as FirebaseUser } from "firebase/auth";

const mockUpdateProfile = vi.fn();

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  };
});

describe("Avatar Paths & PhotoURL Sanitization", () => {
  beforeEach(() => {
    mockUpdateProfile.mockReset();
    mockUpdateProfile.mockResolvedValue(undefined);
  });

  it("should have clean static avatar paths under 50 characters", () => {
    expect(RETRO_AVATARS.length).toBe(8);
    for (const avatarUrl of RETRO_AVATARS) {
      expect(avatarUrl).toMatch(/^\/avatars\/avatar-\d+\.svg$/);
      expect(avatarUrl.length).toBeLessThan(50);
    }
  });

  it("should return deterministic static avatar paths", () => {
    const avatar = getRetroAvatar("test@olmart.dz");
    expect(avatar).toMatch(/^\/avatars\/avatar-\d+\.svg$/);
  });

  it("should sanitize oversized photoURL when calling Firebase Auth updateProfile", async () => {
    const mockUser = { uid: "user_123" } as unknown as FirebaseUser;
    const oversizedPhotoUrl = "data:image/svg+xml;utf8," + "A".repeat(2500);

    await updateUserProfile(mockUser, {
      displayName: "Selma Ait",
      photoURL: oversizedPhotoUrl,
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      mockUser,
      expect.objectContaining({
        displayName: "Selma Ait",
        photoURL: "/avatars/avatar-1.svg",
      })
    );

    // Test with standard static URL
    await updateUserProfile(mockUser, {
      displayName: "Selma Ait",
      photoURL: "/avatars/avatar-3.svg",
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      mockUser,
      expect.objectContaining({
        displayName: "Selma Ait",
        photoURL: "/avatars/avatar-3.svg",
      })
    );
  });

  it("should gracefully recover if Firebase Auth throws invalid-profile-attribute error", async () => {
    const mockUser = { uid: "user_456" } as unknown as FirebaseUser;
    mockUpdateProfile
      .mockRejectedValueOnce(new Error("Firebase: Photo URL too long. (auth/invalid-profile-attribute)."))
      .mockResolvedValueOnce(undefined);

    await expect(
      updateUserProfile(mockUser, {
        displayName: "Karim Ait",
        photoURL: "/some/unsupported-path.jpg",
      })
    ).resolves.toBeUndefined();

    // Verify it retried with photoURL: null
    expect(mockUpdateProfile).toHaveBeenCalledTimes(2);
    expect(mockUpdateProfile).toHaveBeenLastCalledWith(
      mockUser,
      expect.objectContaining({
        displayName: "Karim Ait",
        photoURL: null,
      })
    );
  });
});
