/**
 * missionRunner.js — Manages mission filesystem initialization, seed files,
 * setup scripts, live step checks, and validation in the CheerpX Linux VM.
 */

/**
 * Initializes a mission environment inside the VM:
 * 1. Symlinks /home/learner -> /home/user so both paths work seamlessly.
 * 2. Writes all seedFiles into the VM.
 * 3. Executes the idempotent setupScript.
 *
 * @param {object} vm - Linux VM instance methods from useLinuxVM
 * @param {object} mission - Mission definition object
 */
export async function initializeMissionEnvironment(vm, mission) {
  if (!vm || !vm.ready) {
    throw new Error('Linux VM is not ready');
  }

  // 1. Ensure /home/user exists and create /home/learner symlink for prompt compatibility
  await vm.runCommand(
    'mkdir -p /home/user && if [ ! -e /home/learner ]; then ln -s /home/user /home/learner 2>/dev/null || true; fi'
  );

  // 2. Seed files
  if (Array.isArray(mission.seedFiles) && mission.seedFiles.length > 0) {
    for (const seed of mission.seedFiles) {
      if (seed.path && seed.content !== undefined) {
        // Map /home/learner paths to /home/user if needed
        const resolvedPath = seed.path.replace(/^\/home\/learner\b/, '/home/user');
        await vm.writeFile(resolvedPath, seed.content);
      }
    }
  }

  // 3. Run setup script if provided
  if (mission.setupScript && mission.setupScript.trim().length > 0) {
    const setupResult = await vm.runCommand(mission.setupScript);
    if (setupResult.exitCode !== 0) {
      console.warn('[MissionRunner] Setup script returned non-zero code:', setupResult);
    }
  }

  return true;
}

/**
 * Evaluates live step checklist items silently.
 * Returns an array of completed step IDs: ['s1', 's2']
 *
 * @param {object} vm - Linux VM instance methods
 * @param {Array} steps - Mission steps array [{ id, text, check }]
 * @returns {Promise<string[]>} List of passed step IDs
 */
export async function runStepChecks(vm, steps = []) {
  if (!vm || !vm.ready || !Array.isArray(steps) || steps.length === 0) {
    return [];
  }

  const passedIds = [];

  for (const step of steps) {
    if (!step.check) {
      continue;
    }

    try {
      // Execute the check script with bash under /home/user
      const res = await vm.runCommand(step.check);
      if (res.exitCode === 0) {
        passedIds.push(step.id);
      }
    } catch (err) {
      console.error(`[MissionRunner] Error running step check for ${step.id}:`, err);
    }
  }

  return passedIds;
}

/**
 * Executes the final validation script of the mission.
 * Exit code 0 indicates success.
 *
 * @param {object} vm - Linux VM instance methods
 * @param {object} mission - Mission object with validateScript
 * @returns {Promise<{ success: boolean, exitCode: number, output: string }>}
 */
export async function runValidation(vm, mission) {
  if (!vm || !vm.ready) {
    return { success: false, exitCode: -1, output: 'VM is not ready.' };
  }

  const script = mission.validateScript || (mission.steps && mission.steps[0]?.check) || 'true';
  const res = await vm.runCommand(script);

  return {
    success: res.exitCode === 0,
    exitCode: res.exitCode,
    output: res.stdout || '',
  };
}

/**
 * Fast-forwards the VM state (e.g. if previous mission prerequisite is needed).
 */
export async function runFastForward(vm, mission) {
  if (!vm || !vm.ready || !mission.fastForwardScript) {
    return false;
  }
  const res = await vm.runCommand(mission.fastForwardScript);
  return res.exitCode === 0;
}
