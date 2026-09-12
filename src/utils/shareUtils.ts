import { Story, StoryPage } from '../types';

/**
 * UTF-8 safe Base64 encoding
 */
function toBase64(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (e) {
    console.error('Base64 encoding error:', e);
    return encodeURIComponent(str);
  }
}

/**
 * UTF-8 safe Base64 decoding
 */
function fromBase64(str: string): string {
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  } catch (e) {
    console.error('Base64 decoding error:', e);
    return decodeURIComponent(str);
  }
}

/**
 * Strips transient / session-only fields (like blob URLs or loading flags)
 * before serialization to ensure clean sharing.
 */
function sanitizeStoryForSharing(story: Story): Partial<Story> {
  return {
    id: story.id,
    title: story.title,
    summary: story.summary,
    category: story.category,
    targetAge: story.targetAge,
    artStyle: story.artStyle,
    coverImage: story.coverImage,
    isCustom: true,
    pages: story.pages.map((p) => ({
      pageNumber: p.pageNumber,
      text: p.text,
      illustrationPrompt: p.illustrationPrompt,
      imageUrl: p.imageUrl,
      // Only keep audioUrl if it's not a local blob URL
      audioUrl: p.audioUrl && !p.audioUrl.startsWith('blob:') ? p.audioUrl : undefined,
      interactiveElements: p.interactiveElements,
      imageSize: p.imageSize,
      aspectRatio: p.aspectRatio,
    })),
  };
}

/**
 * Serializes a story into a URL-safe hash string
 */
export function serializeStoryToHash(story: Story): string {
  const sanitized = sanitizeStoryForSharing(story);
  const json = JSON.stringify(sanitized);
  const encoded = toBase64(json);
  return `#story=${encodeURIComponent(encoded)}`;
}

/**
 * Deserializes a story from the URL hash
 */
export function deserializeStoryFromHash(hash: string): Story | null {
  if (!hash) return null;

  try {
    const match = hash.match(/#story=([^&]+)/);
    if (!match || !match[1]) return null;

    const rawEncoded = decodeURIComponent(match[1]);
    const jsonStr = fromBase64(rawEncoded);
    const parsed = JSON.parse(jsonStr);

    // Validate minimal Story schema
    if (parsed && typeof parsed.title === 'string' && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
      return {
        id: parsed.id || `shared-story-${Date.now()}`,
        title: parsed.title,
        summary: parsed.summary || 'A shared magical tale',
        category: parsed.category || 'Shared Comic',
        targetAge: parsed.targetAge || 'All Ages',
        artStyle: parsed.artStyle || 'comic',
        coverImage: parsed.coverImage,
        isCustom: true,
        pages: parsed.pages.map((p: any, idx: number) => ({
          pageNumber: p.pageNumber || idx + 1,
          text: p.text || '',
          illustrationPrompt: p.illustrationPrompt || '',
          imageUrl: p.imageUrl,
          audioUrl: p.audioUrl,
          interactiveElements: p.interactiveElements || [],
          imageSize: p.imageSize || '1K',
          aspectRatio: p.aspectRatio || '4:3',
        })),
      };
    }
  } catch (err) {
    console.warn('Failed to deserialize story from hash:', err);
  }

  return null;
}

/**
 * Generates the full shareable URL containing the current story in hash
 */
export function getShareableStoryUrl(story: Story): string {
  const hash = serializeStoryToHash(story);
  return `${window.location.origin}${window.location.pathname}${hash}`;
}

/**
 * Copies shareable story URL to clipboard
 */
export async function copyShareableStoryUrl(story: Story): Promise<boolean> {
  try {
    const url = getShareableStoryUrl(story);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (e) {
    console.error('Failed to copy share link:', e);
    return false;
  }
}
