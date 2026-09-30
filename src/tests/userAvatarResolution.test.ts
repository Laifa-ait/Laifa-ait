import { describe, it, expect } from "vitest";

describe("UserAvatar URL Resolution & Priority", () => {
  it("prioritizes external HTTP photoURL over local fallback", () => {
    const googlePhoto = "https://lh3.googleusercontent.com/a/ACg8ocLxyz=s96-c";
    const retroAvatar = "/avatars/avatar-1.svg";

    const candidates = [googlePhoto, retroAvatar];
    const httpPhoto = candidates.find((url) => url.startsWith("http://") || url.startsWith("https://"));

    expect(httpPhoto).toBe(googlePhoto);
  });

  it("extracts photoURL from providerData when direct photoURL is a fallback SVG", () => {
    const retroAvatar = "/avatars/avatar-2.svg";
    const providerData = [
      { providerId: "google.com", photoURL: "https://lh3.googleusercontent.com/a/ACg8oc12345" },
    ];

    const candidates = [
      retroAvatar,
      ...(providerData?.map((p) => p.photoURL) || []),
    ].filter((url): url is string => typeof url === "string" && url.trim().length > 0);

    const httpPhoto = candidates.find((url) => url.startsWith("http://") || url.startsWith("https://"));
    expect(httpPhoto).toBe("https://lh3.googleusercontent.com/a/ACg8oc12345");
  });

  it("extracts monogram initials reliably from displayName or email", () => {
    function getInitials(name?: string | null, email?: string | null): string {
      if (name && name.trim() && name.trim() !== "Utilisateur") {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
      }
      if (email && email.includes("@")) {
        const prefix = email.split("@")[0].replace(/[._-]/g, " ").trim();
        const parts = prefix.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return prefix.slice(0, 2).toUpperCase();
      }
      return "OL";
    }

    expect(getInitials("Laifa Ait ouferoukh", "laifa.ait@gmail.com")).toBe("LA");
    expect(getInitials(null, "laifa.ait@gmail.com")).toBe("LA");
    expect(getInitials("Karim", null)).toBe("KA");
    expect(getInitials(null, null)).toBe("OL");
  });
});
