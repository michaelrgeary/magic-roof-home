import { describe, it, expect } from "vitest";
import { generateSlug, generateUniqueSlug } from "@/lib/slugify";

describe("generateSlug", () => {
  it("converts text to lowercase", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("this is a test")).toBe("this-is-a-test");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello! @World#")).toBe("hello-world");
  });

  it("removes apostrophes", () => {
    expect(generateSlug("John's Roofing")).toBe("johns-roofing");
    expect(generateSlug("It's a test")).toBe("its-a-test");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("hello    world")).toBe("hello-world");
  });

  it("handles multiple hyphens", () => {
    expect(generateSlug("hello---world")).toBe("hello-world");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("-hello world-")).toBe("hello-world");
    expect(generateSlug("  hello world  ")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles string with only special characters", () => {
    expect(generateSlug("!@#$%^&*()")).toBe("");
  });

  it("handles numbers", () => {
    expect(generateSlug("Area 51 Roofing")).toBe("area-51-roofing");
  });
});

describe("generateUniqueSlug", () => {
  it("returns base slug when no conflicts", () => {
    expect(generateUniqueSlug("hello-world", [])).toBe("hello-world");
    expect(generateUniqueSlug("hello-world", ["other-slug"])).toBe("hello-world");
  });

  it("appends -2 when base slug exists", () => {
    expect(generateUniqueSlug("hello-world", ["hello-world"])).toBe("hello-world-2");
  });

  it("increments counter until unique", () => {
    const existing = ["my-post", "my-post-2", "my-post-3"];
    expect(generateUniqueSlug("my-post", existing)).toBe("my-post-4");
  });

  it("handles large number of existing slugs", () => {
    const existing = Array.from({ length: 10 }, (_, i) => 
      i === 0 ? "test" : `test-${i + 1}`
    );
    expect(generateUniqueSlug("test", existing)).toBe("test-11");
  });
});
