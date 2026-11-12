const prisma = require('../../db');
const { validateDisplayName } = require('../utils/displayName');

/**
 * PATCH /api/user/name
 * Saves the authenticated user's display name after validation.
 */
async function updateUserName(req, res) {
  try {
    const validation = validateDisplayName(req.body?.name);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { displayName: validation.value },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
      },
    });

    const savedName = updatedUser.displayName?.trim() || null;

    return res.status(200).json({
      success: true,
      redirectTo: '/dashboard',
      user: {
        ...updatedUser,
        displayName: savedName,
        name: savedName,
      },
    });
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }
    console.error('[updateUserName Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to save your name. Please try again.',
    });
  }
}

module.exports = { updateUserName };

