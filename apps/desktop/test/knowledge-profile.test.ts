import {
  buildUserProfileRecord,
  getUserDisplayName,
  readUserProfile,
} from '@/features/dashboard/lib/knowledge-profile';

describe('knowledge user profile', () => {
  it('round trips structured profile fields through a knowledge record', () => {
    const record = buildUserProfileRecord(
      {
        displayName: ' 伊吹 ',
        role: '大学生   / 個人開発者',
        activities: 'Web開発',
        usageScenes: '会議、1on1',
      },
      '2026/07/26',
    );

    expect(readUserProfile([record])).toEqual({
      displayName: '伊吹',
      role: '大学生 / 個人開発者',
      activities: 'Web開発',
      usageScenes: '会議、1on1',
    });
    expect(getUserDisplayName([record])).toBe('伊吹');
  });

  it('uses a non-identifying fallback when no profile exists', () => {
    expect(getUserDisplayName([])).toBe('User');
  });
});
