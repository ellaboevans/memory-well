"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getDomainSuffix } from "@/lib/config";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { z } from "zod";

const createWallSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "URL slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only use letters, numbers, and hyphens"),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s-]/g, "")
    .replaceAll(/[\s_-]+/g, "-")
    .replaceAll(/^-+/g, "")
    .replaceAll(/-+$/g, "");
}

interface CreateWallDialogProps {
  readonly children?: React.ReactNode;
}

export function CreateWallDialog({ children }: CreateWallDialogProps) {
  const router = useRouter();
  const profile = useQuery(api.profiles.me);
  const walls = useQuery(api.walls.listMyWalls);
  const createWall = useMutation(api.walls.create);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateMore = profile?.tier === "premium" || (walls?.length ?? 0) < 3;

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
      setSlug("");
      setSlugManuallyEdited(false);
      setDescription("");
      setError(null);
    }
  }, [open]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = createWallSchema.safeParse({
      title: title.trim(),
      slug: slug.trim(),
    });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const wallId = await createWall({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });
      setOpen(false);
      router.push(`/dashboard/walls/${wallId}`);
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific Convex errors
        if (err.message.includes("already taken")) {
          setError("This URL slug is already taken. Please choose another.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to create wall");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user can't create more walls, show upgrade message
  if (!canCreateMore) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children ?? (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Wall
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Wall Limit Reached</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Free accounts can create up to 3 walls. Upgrade to Premium for
              unlimited walls.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <div className="text-6xl">🔒</div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={() => router.push("/dashboard/billing")}>
              Upgrade to Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Wall
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a Memory Wall</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Set up your wall to start collecting signatures and messages.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Wall Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Sarah & John's Wedding"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? "title-error" : undefined}
              />
              {fieldErrors.title && (
                <p id="title-error" className="text-xs text-red-400">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="grid gap-2">
              <Label htmlFor="create-slug">
                URL Slug <span className="text-red-400">*</span>
              </Label>
              <div className="flex rounded-md">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-500 text-sm">
                  {getDomainSuffix()}
                </span>
                <Input
                  id="create-slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="sarah-john-wedding"
                  className="rounded-l-none bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  aria-invalid={Boolean(fieldErrors.slug)}
                  aria-describedby={fieldErrors.slug ? "slug-error" : undefined}
                />
              </div>
              <p className="text-xs text-zinc-500">
                Only lowercase letters, numbers, and hyphens. Cannot be changed
                later.
              </p>
              {fieldErrors.slug && (
                <p id="slug-error" className="text-xs text-red-400">
                  {fieldErrors.slug}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-zinc-500">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Leave a message for the happy couple!"
                rows={3}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
              />
            </div>

            {/* Info note */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">Note:</span> New
                walls are created as private. You can change visibility in
                settings after creation.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-zinc-700"
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Wall"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
