const missionService = require('./missionService');

async function getMission(req, res, next) {
  try {
    const missionId = parseInt(req.params.id, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    const userId = req.user?.id || null;
    const mission = await missionService.getMissionById(missionId, userId);
    res.json({ success: true, mission });
  } catch (err) {
    if (err.message === 'Mission not found') {
      return res.status(404).json({ error: 'Mission not found' });
    }
    next(err);
  }
}

async function startMission(req, res, next) {
  try {
    const missionId = parseInt(req.params.id, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to track progress' });
    }
    const result = await missionService.startMission(missionId, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getHint(req, res) {
  try {
    const missionId = parseInt(req.params.id, 10);
    const hintIndex = parseInt(req.params.index, 10);
    if (isNaN(missionId) || isNaN(hintIndex)) {
      return res.status(400).json({ error: 'Invalid mission or hint index' });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const result = await missionService.revealHint(missionId, hintIndex, userId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function saveProgress(req, res, next) {
  try {
    const missionId = parseInt(req.params.id, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { stepsCompleted, hintsUsed } = req.body;
    const result = await missionService.saveProgress(missionId, userId, { stepsCompleted, hintsUsed });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function completeMission(req, res) {
  try {
    const missionId = parseInt(req.params.id, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { timeElapsedSeconds } = req.body;
    const result = await missionService.completeMission(missionId, userId, { timeElapsedSeconds });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getMission,
  startMission,
  getHint,
  saveProgress,
  completeMission,
};
