"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  name: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function InitialsAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = getInitials(name) || "MT";

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-800",
        className,
      )}
      aria-label={name}
    >
      <span className="select-none text-[clamp(2rem,12vw,5rem)] font-black tracking-tight text-white/95">
        {initials}
      </span>
    </div>
  );
}

export function ProfileAvatar({
  name,
  className,
  imageClassName,
  sizes = "460px",
  priority = false,
}: ProfileAvatarProps) {
  const [hasPhoto, setHasPhoto] = useState(false);

  useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => setHasPhoto(true);
    probe.src = "/profile.png";
  }, []);

  if (hasPhoto) {
    return (
      <Image
        src="/profile.png"
        alt={name}
        fill
        className={cn("object-cover object-[center_18%]", imageClassName)}
        priority={priority}
        sizes={sizes}
      />
    );
  }

  return <InitialsAvatar name={name} className={className} />;
}
