<script lang="ts">
    import type { Component } from "svelte";

    interface AvatarProps {
        /** Name to derive initials from (e.g. "Juan Pérez" → "JP") */
        name: string;
        /** Size in pixels (default: 80) */
        size?: number;
        /** Optional explicit background color (hex without #). If not provided, deterministic from name. */
        bgColor?: string;
        /** Optional explicit text color (hex without #). Default: white for dark backgrounds. */
        textColor?: string;
        /** Optional CSS class for the outer element */
        class?: string;
        /** Alt text for the image */
        alt?: string;
        /** Rounded corners (default: true for circle) */
        rounded?: boolean;
    }

    let {
        name = "",
        size = 80,
        bgColor,
        textColor,
        class: className = "",
        alt = "Avatar",
        rounded = true,
    }: AvatarProps = $props();

    // Deterministic color from string (simple hash)
    function hashColor(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Generate a pleasant pastel-ish color (avoid too light/dark)
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 65%, 42%)`;
    }

    // Determine text color for contrast (white or black)
    function contrastColor(hex: string): string {
        // Convert hsl to rgb for luminance calc
        const match = hex.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match) return "#fff";
        const l = parseInt(match[3], 10);
        return l > 55 ? "#000" : "#fff";
    }

    const displayName = $derived(
        name.includes("@") ? name.split("@")[0] : name,
    );

    const initials = $derived.by(() => {
        if (!displayName) return "?";

        const parts = displayName.trim().split(/[\s._-]+/);

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }

        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    });

    const resolvedBg = $derived(bgColor ?? hashColor(name || "default"));
    const resolvedText = $derived(textColor ?? contrastColor(resolvedBg));
    const fontSize = $derived(Math.round(size * 0.5));
    const style = $derived(
        `width: ${size}px; height: ${size}px; ${rounded ? "border-radius: 50%;" : "border-radius: 12px;"} background: ${resolvedBg}; color: ${resolvedText}; font-size: ${fontSize}px;`,
    );
</script>

<div
    class="avatar {className}"
    {style}
    role="img"
    aria-label={alt}
    title={name || alt}
>
    {initials}
</div>

<style>
    .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-weight: 700;
        line-height: 1;
        user-select: none;
        border: 2px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        background-clip: padding-box;
    }

    .avatar:empty {
        /* fallback if somehow no initials */
        content: "?";
    }
</style>

