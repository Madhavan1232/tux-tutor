/**
 * seed.js — Seeds the database with the 8 Linux learning worlds and their missions,
 * including rich mission instructions, interactive step checklists, seed files,
 * setup scripts, validators, and hints for the Mission Workspace.
 *
 * Idempotent: uses upsert so it's safe to run multiple times.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WORLDS = [
  {
    id: 1,
    name: 'Linux Basics',
    orderIndex: 1,
    unlockRequirement: 0,
    missions: [
      {
        orderIndex: 1,
        type: 'mission',
        title: 'Explore Your Terminal: pwd, ls, and Redirection',
        description: 'Inspect your working directory, list files, and create proof files with output redirection.',
        xpReward: 50,
        command: 'pwd > where.txt && ls > files.txt && echo "tux" > hello.txt',
        expectedOutput: '',
        goal: 'Save your current location to where.txt, list directory files to files.txt, and create hello.txt containing tux.',
        instructions: `### Welcome to the Linux Terminal\n\nEvery journey in Linux starts by knowing where you are and what is around you.\n\n- The \`pwd\` (**P**rint **W**orking **D**irectory) command outputs your current location in the filesystem hierarchy.\n- The \`ls\` (**L**i**s**t) command reveals the files and directories inside your current folder.\n- In Linux, the \`>\` operator redirects command output into a file.\n  - Save your current directory: \`pwd > where.txt\`\n  - Save your file list: \`ls > files.txt\`\n  - Write text into a file: \`echo "tux" > hello.txt\`\n\nRun each command with redirection to complete the checklist steps and master the basics!`,
        steps: [
          { id: 's1', text: 'Save your working directory: pwd > where.txt', check: 'test -f ~/where.txt && grep -q "/home/user" ~/where.txt' },
          { id: 's2', text: 'Save the file list: ls > files.txt', check: 'test -f ~/files.txt && grep -q "notes.txt" ~/files.txt' },
          { id: 's3', text: 'Create hello.txt containing "tux": echo "tux" > hello.txt', check: 'test -f ~/hello.txt && grep -qi "tux" ~/hello.txt' },
        ],
        seedFiles: [
          { path: '/home/user/notes.txt', content: "Welcome to Tux Tutor!\nLinux is a family of open-source Unix-like operating systems.\nMaster the terminal to rule the servers.\n" },
          { path: '/home/user/data.csv', content: "id,name,role\n1,tux,mascot\n2,user,sysadmin\n" },
        ],
        setupScript: 'touch ~/.bash_history && chmod 600 ~/.bash_history && rm -f ~/where.txt ~/files.txt ~/hello.txt',
        validateScript: 'test -f ~/where.txt && grep -q "/home/user" ~/where.txt && test -f ~/files.txt && grep -q "notes.txt" ~/files.txt && test -f ~/hello.txt && grep -qi "tux" ~/hello.txt',
        fastForwardScript: 'pwd > ~/where.txt && ls > ~/files.txt && echo "tux" > ~/hello.txt',
        hints: [
          'Run: pwd > where.txt to save your current working directory path.',
          'Run: ls > files.txt to capture directory listing.',
          'Run: echo "tux" > hello.txt to create hello.txt containing tux.',
          'Full answer: pwd > where.txt && ls > files.txt && echo "tux" > hello.txt',
        ],
        allowUpload: false,
        minSeconds: 2,
      },
      {
        orderIndex: 2,
        type: 'mission',
        title: 'Directory & File Creation: mkdir, cd, touch',
        description: 'Create directories and create empty files.',
        xpReward: 50,
        command: 'mkdir ~/workspace && touch ~/workspace/app.sh',
        expectedOutput: '',
        goal: 'Create a directory named workspace in your home folder and create app.sh inside it.',
        instructions: `### Organizing Your Files\n\nIn Linux, folders are called directories. You create them with \`mkdir\`.\n\n- \`mkdir <name>\`: Makes a new directory.\n- \`cd <name>\`: Changes directory.\n- \`touch <filename>\`: Creates a blank new file.\n\nCreate a dedicated \`workspace\` directory and prepare \`app.sh\` inside it.`,
        steps: [
          { id: 's1', text: 'Create directory named workspace in your home folder', check: 'test -d ~/workspace' },
          { id: 's2', text: 'Create an empty file named app.sh inside workspace', check: 'test -f ~/workspace/app.sh' },
        ],
        seedFiles: [],
        setupScript: 'rm -rf ~/workspace',
        validateScript: 'test -d ~/workspace && test -f ~/workspace/app.sh',
        fastForwardScript: 'mkdir -p ~/workspace && touch ~/workspace/app.sh',
        hints: [
          'Use mkdir ~/workspace to create the directory.',
          'Use touch ~/workspace/app.sh to create the script file.',
          'Full answer: mkdir ~/workspace && touch ~/workspace/app.sh',
        ],
        allowUpload: false,
        minSeconds: 3,
        requiresStateFrom: 1,
      },
      {
        orderIndex: 3,
        type: 'mission',
        title: 'Navigating Paths',
        description: 'Use cd .. and relative vs absolute paths.',
        xpReward: 50,
        command: 'pwd',
        expectedOutput: '',
        goal: 'Create a nested path structure and verify absolute navigation.',
        instructions: 'Learn how to traverse directories using `cd ..`, `cd ~`, and relative paths.',
        steps: [
          { id: 's1', text: 'Create nested directory ~/alpha/beta', check: 'test -d ~/alpha/beta' },
          { id: 's2', text: 'Create file ~/alpha/beta/marker.txt', check: 'test -f ~/alpha/beta/marker.txt' },
        ],
        seedFiles: [],
        setupScript: 'rm -rf ~/alpha',
        validateScript: 'test -d ~/alpha/beta && test -f ~/alpha/beta/marker.txt',
        hints: ['Use mkdir -p ~/alpha/beta', 'Use touch ~/alpha/beta/marker.txt'],
      },
      {
        orderIndex: 4,
        type: 'mission',
        title: 'Listing Hidden Files: ls -a',
        description: 'Uncover hidden dotfiles with ls -la.',
        xpReward: 50,
        command: 'ls -la',
        expectedOutput: '',
        goal: 'Find the hidden secret in .tux_secret and copy its contents to revealed.txt.',
        instructions: 'Files starting with a dot `.` are hidden from normal `ls`. Use `ls -a` to find them.',
        steps: [
          { id: 's1', text: 'Inspect hidden file .tux_secret', check: 'test -f ~/.tux_secret' },
          { id: 's2', text: 'Copy .tux_secret to revealed.txt', check: 'test -f ~/revealed.txt' },
        ],
        seedFiles: [
          { path: '/home/user/.tux_secret', content: 'SECRET_FLAG_TUX_2026\n' },
        ],
        setupScript: 'rm -f ~/revealed.txt',
        validateScript: 'test -f ~/revealed.txt && cmp -s ~/.tux_secret ~/revealed.txt',
        hints: ['Run ls -la to see hidden files', 'Run cp ~/.tux_secret ~/revealed.txt'],
      },
      {
        orderIndex: 5,
        type: 'mission',
        title: 'Getting Help: man & --help',
        description: 'Learn how to read documentation right from the terminal.',
        xpReward: 50,
        command: 'man ls',
        expectedOutput: '',
        goal: 'Output the help summary for mkdir to help_mkdir.txt.',
        instructions: 'Command-line tools offer help flags. Redirect `mkdir --help` into `help_mkdir.txt`.',
        steps: [
          { id: 's1', text: 'Save mkdir help to ~/help_mkdir.txt', check: 'test -f ~/help_mkdir.txt && [ -s ~/help_mkdir.txt ]' },
        ],
        setupScript: 'rm -f ~/help_mkdir.txt',
        validateScript: 'test -f ~/help_mkdir.txt && [ -s ~/help_mkdir.txt ]',
        hints: ['Run: mkdir --help > ~/help_mkdir.txt'],
      },
      {
        orderIndex: 6,
        type: 'boss',
        title: 'World 1 Boss: Terminal Navigation Trial',
        description: 'Demonstrate all basic navigation and file creation skills under pressure.',
        xpReward: 150,
        command: '',
        expectedOutput: '',
        goal: 'Construct the secure mission_boss structure with config.json, secret.key, and an active symlink.',
        instructions: `### Boss Challenge: Navigation Trial\n\nProve your mastery over the terminal filesystem hierarchy!\n\n1. Create a directory named \`~/mission_boss\`.\n2. Inside \`mission_boss\`, create \`config.json\` containing \`{"status":"online"}\`.\n3. Create \`secret.key\` containing \`tux4life\`.\n4. Create a symbolic link at \`~/active_config.json\` pointing to \`~/mission_boss/config.json\`.\n\nTake your time and ensure each component is accurately placed.`,
        steps: [
          { id: 's1', text: 'Create directory ~/mission_boss', check: 'test -d ~/mission_boss' },
          { id: 's2', text: 'Create ~/mission_boss/config.json with status online', check: 'test -f ~/mission_boss/config.json && grep -q "online" ~/mission_boss/config.json' },
          { id: 's3', text: 'Create ~/mission_boss/secret.key with tux4life', check: 'test -f ~/mission_boss/secret.key && grep -q "tux4life" ~/mission_boss/secret.key' },
          { id: 's4', text: 'Create symbolic link ~/active_config.json -> ~/mission_boss/config.json', check: 'test -L ~/active_config.json' },
        ],
        seedFiles: [],
        setupScript: 'rm -rf ~/mission_boss ~/active_config.json',
        validateScript: 'test -d ~/mission_boss && test -f ~/mission_boss/config.json && test -f ~/mission_boss/secret.key && test -L ~/active_config.json',
        fastForwardScript: 'mkdir -p ~/mission_boss && echo \'{"status":"online"}\' > ~/mission_boss/config.json && echo \'tux4life\' > ~/mission_boss/secret.key && ln -s ~/mission_boss/config.json ~/active_config.json',
        hints: [
          'Boss hint 1: Use mkdir ~/mission_boss and echo to populate the files.',
          'Boss hint 2: ln -s <target> <link_name> creates symbolic links.',
          'Boss hint 3 (Full Solution): mkdir -p ~/mission_boss && echo \'{"status":"online"}\' > ~/mission_boss/config.json && echo \'tux4life\' > ~/mission_boss/secret.key && ln -s ~/mission_boss/config.json ~/active_config.json',
        ],
        minSeconds: 5,
      },
    ],
  },
  {
    id: 2,
    name: 'Files & Directories',
    orderIndex: 2,
    unlockRequirement: 5,
    missions: [
      { title: 'ls and cd', orderIndex: 1, type: 'mission', xpReward: 50, description: 'Navigate directories with ls and cd.', command: 'ls -la', expectedOutput: '' },
      { title: 'mkdir & touch', orderIndex: 2, type: 'mission', xpReward: 50, description: 'Create directories and files.', command: 'mkdir mydir && touch mydir/file.txt', expectedOutput: '' },
      {
        orderIndex: 3,
        type: 'mission',
        title: 'Make a backup folder',
        description: 'Safeguard your data by creating a backup directory and duplicating notes.txt.',
        xpReward: 50,
        command: 'cp notes.txt backup/',
        expectedOutput: '',
        goal: 'Create a folder named backup in your home directory and copy notes.txt into it.',
        instructions: `### Backing Up Important Files\n\nData integrity is vital in sysadmin work. The \`cp\` (**C**o**p**y) command duplicates files and directories.\n\n- \`cp <source> <destination>\`: Copies a single file to a target directory or new name.\n- Example: \`cp myfile.txt backup/\`.\n\nCreate a new folder named \`backup\` and copy \`notes.txt\` into it.`,
        steps: [
          { id: 's1', text: 'Create a folder named backup in your home directory', check: 'test -d ~/backup' },
          { id: 's2', text: 'Copy notes.txt into ~/backup/', check: 'test -f ~/backup/notes.txt' },
        ],
        seedFiles: [
          { path: '/home/user/notes.txt', content: "Critical mission logs.\nBackup required for high availability.\nTux Tutor mission 3 data.\n" },
        ],
        setupScript: 'mkdir -p ~/projects && echo "hi" > ~/projects/readme.md && echo "Critical mission logs.\nBackup required for high availability.\nTux Tutor mission 3 data." > ~/notes.txt && rm -rf ~/backup',
        validateScript: 'test -d ~/backup && test -f ~/backup/notes.txt && cmp -s ~/notes.txt ~/backup/notes.txt',
        fastForwardScript: 'mkdir -p ~/backup && cp ~/notes.txt ~/backup/notes.txt',
        hints: [
          'Think about the mkdir command: mkdir ~/backup',
          'Use cp <source> <destination>: cp ~/notes.txt ~/backup/',
          'Full answer: mkdir -p ~/backup && cp ~/notes.txt ~/backup/notes.txt',
        ],
        allowUpload: false,
        minSeconds: 3,
      },
      { title: 'rm and find', orderIndex: 4, type: 'mission', xpReward: 50, description: 'Remove files and find them.', command: 'find . -name "*.txt"', expectedOutput: '' },
      { title: 'File Inspection', orderIndex: 5, type: 'mission', xpReward: 60, description: 'Inspect files with cat, head, tail.', command: 'cat /etc/os-release', expectedOutput: '' },
      { title: 'World 2 Boss', orderIndex: 6, type: 'boss', xpReward: 150, description: 'Master the filesystem hierarchy.', command: '', expectedOutput: '' },
    ],
  },
  {
    id: 3,
    name: 'Text Processing',
    orderIndex: 3,
    unlockRequirement: 5,
    missions: [
      {
        orderIndex: 1,
        type: 'mission',
        title: 'Log File Analysis & Line Counting',
        description: 'Upload and inspect log data using terminal utilities.',
        xpReward: 60,
        command: 'wc -l <file> > count.txt',
        expectedOutput: '',
        goal: 'Upload a .log or .txt file, count its lines with wc -l, and save the result to count.txt.',
        instructions: `### Ingesting & Analyzing Files\n\nSysadmins frequently ingest server logs and parse their metrics.\n\n1. Use the **Upload** button on the terminal toolbar to upload a \`.log\` or \`.txt\` file into your workspace (or examine the sample \`sample.log\`).\n2. Count the number of lines using \`wc -l <file>\`.\n3. Save the result into \`count.txt\` using output redirection: \`wc -l sample.log > count.txt\`.\n\nNotice that the Upload button is enabled for this mission!`,
        allowUpload: true,
        uploadConfig: {
          maxSizeMB: 2,
          allowedExtensions: ['.log', '.txt', '.csv'],
        },
        steps: [
          { id: 's1', text: 'Upload or verify a log file in your workspace', check: 'test -f ~/sample.log || ls ~/uploads/*.log ~/uploads/*.txt 2>/dev/null | grep -q .' },
          { id: 's2', text: 'Save line count output into count.txt', check: 'test -f ~/count.txt && [ -s ~/count.txt ]' },
        ],
        seedFiles: [
          { path: '/home/user/sample.log', content: "2026-11-08 20:00:01 INFO System booting\n2026-11-08 20:00:02 INFO Initializing network\n2026-11-08 20:00:03 WARN Disk quota check\n2026-11-08 20:00:04 INFO Ready for learning\n" },
        ],
        setupScript: 'mkdir -p ~/uploads && rm -f ~/count.txt',
        validateScript: 'test -f ~/count.txt && [ -s ~/count.txt ]',
        fastForwardScript: 'wc -l ~/sample.log > ~/count.txt',
        hints: [
          'You can upload your own file using the Upload button on the toolbar or use ~/sample.log.',
          'Run wc -l ~/sample.log to see the line count.',
          'Full answer: wc -l ~/sample.log > ~/count.txt',
        ],
        minSeconds: 3,
      },
      { title: 'sed & awk', orderIndex: 2, type: 'mission', xpReward: 60, description: 'Transform text with sed and awk.', command: 'echo "hello world" | sed "s/world/linux/"', expectedOutput: 'hello linux' },
      { title: 'sort & uniq', orderIndex: 3, type: 'mission', xpReward: 60, description: 'Sort and deduplicate text.', command: 'sort /etc/passwd | uniq', expectedOutput: '' },
      { title: 'cut & paste', orderIndex: 4, type: 'mission', xpReward: 60, description: 'Extract columns with cut.', command: 'cut -d: -f1 /etc/passwd', expectedOutput: '' },
      { title: 'World 3 Boss', orderIndex: 5, type: 'boss', xpReward: 175, description: 'Chain text processing tools.', command: '', expectedOutput: '' },
    ],
  },
  {
    id: 4,
    name: 'Permissions',
    orderIndex: 4,
    unlockRequirement: 4,
    missions: [
      { title: 'chmod basics', orderIndex: 1, type: 'mission', xpReward: 60, description: 'Change file permissions.', command: 'chmod 755 script.sh', expectedOutput: '' },
      { title: 'chown & chgrp', orderIndex: 2, type: 'mission', xpReward: 60, description: 'Change file ownership.', command: 'chown user:group file.txt', expectedOutput: '' },
      { title: 'Octal modes', orderIndex: 3, type: 'mission', xpReward: 70, description: 'Use numeric permission modes.', command: 'chmod 644 file.txt', expectedOutput: '' },
      { title: 'umask', orderIndex: 4, type: 'mission', xpReward: 70, description: 'Understand and set umask.', command: 'umask', expectedOutput: '' },
      { title: 'World 4 Boss', orderIndex: 5, type: 'boss', xpReward: 175, description: 'Apply complex permission schemes.', command: '', expectedOutput: '' },
    ],
  },
  {
    id: 5,
    name: 'Processes',
    orderIndex: 5,
    unlockRequirement: 4,
    missions: [
      { title: 'ps and top', orderIndex: 1, type: 'mission', xpReward: 70, description: 'View running processes.', command: 'ps aux', expectedOutput: '' },
      { title: 'kill & signals', orderIndex: 2, type: 'mission', xpReward: 70, description: 'Send signals to processes.', command: 'kill -9 1234', expectedOutput: '' },
      { title: 'Background jobs', orderIndex: 3, type: 'mission', xpReward: 70, description: 'Run jobs in the background.', command: 'sleep 10 &', expectedOutput: '' },
      { title: 'nice & priority', orderIndex: 4, type: 'mission', xpReward: 75, description: 'Control process priority.', command: 'nice -n 10 sleep 5', expectedOutput: '' },
      { title: 'World 5 Boss', orderIndex: 5, type: 'boss', xpReward: 200, description: 'Debug a stuck process scenario.', command: '', expectedOutput: '' },
    ],
  },
  {
    id: 6,
    name: 'Networking',
    orderIndex: 6,
    unlockRequirement: 4,
    missions: [
      { title: 'ping & curl', orderIndex: 1, type: 'mission', xpReward: 75, description: 'Test network connectivity.', command: 'ping -c 4 google.com', expectedOutput: '' },
      { title: 'ssh basics', orderIndex: 2, type: 'mission', xpReward: 75, description: 'Connect via SSH.', command: 'ssh user@host', expectedOutput: '' },
      { title: 'netstat & ss', orderIndex: 3, type: 'mission', xpReward: 75, description: 'Inspect network connections.', command: 'ss -tulpn', expectedOutput: '' },
      { title: 'dig & nslookup', orderIndex: 4, type: 'mission', xpReward: 80, description: 'Query DNS records.', command: 'dig google.com', expectedOutput: '' },
      { title: 'World 6 Boss', orderIndex: 5, type: 'boss', xpReward: 200, description: 'Diagnose a network issue.', command: '', expectedOutput: '' },
    ],
  },
  {
    id: 7,
    name: 'Shell Scripting',
    orderIndex: 7,
    unlockRequirement: 4,
    missions: [
      { title: 'Your first script', orderIndex: 1, type: 'mission', xpReward: 80, description: 'Write and execute a shell script.', command: 'bash script.sh', expectedOutput: '' },
      { title: 'Variables & loops', orderIndex: 2, type: 'mission', xpReward: 80, description: 'Use variables and for loops.', command: 'for i in 1 2 3; do echo $i; done', expectedOutput: '' },
      { title: 'Conditionals', orderIndex: 3, type: 'mission', xpReward: 80, description: 'Use if/else in scripts.', command: 'if [ -f file ]; then echo yes; fi', expectedOutput: '' },
      { title: 'Functions & args', orderIndex: 4, type: 'mission', xpReward: 85, description: 'Define and call functions.', command: '', expectedOutput: '' },
      { title: 'World 7 Boss', orderIndex: 5, type: 'boss', xpReward: 225, description: 'Write a real automation script.', command: '', expectedOutput: '' },
    ],
  },
  {
    id: 8,
    name: 'System Administration',
    orderIndex: 8,
    unlockRequirement: 4,
    missions: [
      { title: 'systemd basics', orderIndex: 1, type: 'mission', xpReward: 90, description: 'Manage services with systemctl.', command: 'systemctl status', expectedOutput: '' },
      { title: 'journalctl', orderIndex: 2, type: 'mission', xpReward: 90, description: 'Read system logs.', command: 'journalctl -n 50', expectedOutput: '' },
      { title: 'cron jobs', orderIndex: 3, type: 'mission', xpReward: 90, description: 'Schedule tasks with cron.', command: 'crontab -l', expectedOutput: '' },
      { title: 'Firewall rules', orderIndex: 4, type: 'mission', xpReward: 100, description: 'Configure ufw firewall.', command: 'ufw status', expectedOutput: '' },
      { title: 'World 8 Boss', orderIndex: 5, type: 'boss', xpReward: 250, description: 'Harden a fresh Linux server.', command: '', expectedOutput: '' },
    ],
  },
];

async function main() {
  console.log('🐧 Seeding Tux Tutor database with interactive missions…');

  for (const worldData of WORLDS) {
    const { missions, ...worldFields } = worldData;

    // Upsert world
    const world = await prisma.world.upsert({
      where: { id: worldFields.id },
      update: {
        name: worldFields.name,
        orderIndex: worldFields.orderIndex,
        unlockRequirement: worldFields.unlockRequirement,
      },
      create: worldFields,
    });

    console.log(`  ✓ World ${world.orderIndex}: ${world.name}`);

    // Upsert missions for this world
    for (const missionData of missions) {
      const missionId = (worldFields.id - 1) * 10 + missionData.orderIndex;
      const dataToSave = {
        title: missionData.title,
        description: missionData.description,
        type: missionData.type,
        xpReward: missionData.xpReward,
        orderIndex: missionData.orderIndex,
        command: missionData.command || '',
        expectedOutput: missionData.expectedOutput || '',
        instructions: missionData.instructions || null,
        goal: missionData.goal || null,
        steps: missionData.steps || null,
        seedFiles: missionData.seedFiles || null,
        setupScript: missionData.setupScript || null,
        validateScript: missionData.validateScript || null,
        fastForwardScript: missionData.fastForwardScript || null,
        hints: missionData.hints || null,
        allowUpload: Boolean(missionData.allowUpload),
        uploadConfig: missionData.uploadConfig || null,
        minSeconds: missionData.minSeconds || 3,
        requiresStateFrom: missionData.requiresStateFrom || null,
      };

      await prisma.mission.upsert({
        where: { id: missionId },
        update: dataToSave,
        create: {
          id: missionId,
          worldId: world.id,
          ...dataToSave,
        },
      });
    }

    console.log(`    └─ Seeded ${missions.length} missions`);
  }

  console.log('\n✅ Database successfully seeded with interactive missions!');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
