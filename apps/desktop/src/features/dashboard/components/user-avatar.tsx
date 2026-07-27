import { normalizeAvatarDataUrl } from '@/features/dashboard/lib/user-avatar';

type UserAvatarProps = {
  className?: string;
  imageDataUrl?: string;
};

export function UserAvatar({ className = '', imageDataUrl }: UserAvatarProps) {
  const safeImage = normalizeAvatarDataUrl(imageDataUrl);

  return (
    <span className={`user-avatar user-avatar-v2 ${className}`.trim()}>
      {safeImage ? (
        <img alt="" src={safeImage} />
      ) : (
        <span aria-hidden="true" className="user-avatar-silhouette" />
      )}
    </span>
  );
}
