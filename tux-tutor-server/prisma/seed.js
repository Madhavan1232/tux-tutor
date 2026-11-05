/**
 * seed.js — Seeds the database with the 8 Linux learning worlds and their missions.
 * Run with: node prisma/seed.js
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
      { title: 'Hello Terminal',     orderIndex: 1, type: 'mission', xpReward: 50, description: 'Open a terminal and say hello.',                   command: 'echo "Hello, Linux!"',     expectedOutput: 'Hello, Linux!' },
      { title: 'Your First Command', orderIndex: 2, type: 'mission', xpReward: 50, description: 'Run your first Linux command.',                     command: 'whoami',                   expectedOutput: '' },
      { title: 'Navigating Paths',   orderIndex: 3, type: 'mission', xpReward: 50, description: 'Use pwd to see where you are.',                     command: 'pwd',                      expectedOutput: '' },
      { title: 'Listing Files',      orderIndex: 4, type: 'mission', xpReward: 50, description: 'List files in the current directory.',              command: 'ls',                       expectedOutput: '' },
      { title: 'Getting Help',       orderIndex: 5, type: 'mission', xpReward: 50, description: 'Use man to read documentation.',                    command: 'man ls',                   expectedOutput: '' },
      { title: 'World 1 Boss',       orderIndex: 6, type: 'boss',    xpReward: 150, description: 'Demonstrate all basic navigation skills.',         command: '', expectedOutput: '' },
    ],
  },
  {
    id: 2,
    name: 'Files & Directories',
    orderIndex: 2,
    unlockRequirement: 5,
    missions: [
      { title: 'ls and cd',         orderIndex: 1, type: 'mission', xpReward: 50, description: 'Navigate directories with ls and cd.',              command: 'ls -la',   expectedOutput: '' },
      { title: 'mkdir & touch',     orderIndex: 2, type: 'mission', xpReward: 50, description: 'Create directories and files.',                     command: 'mkdir mydir && touch mydir/file.txt', expectedOutput: '' },
      { title: 'cp and mv',         orderIndex: 3, type: 'mission', xpReward: 50, description: 'Copy and move files.',                              command: 'cp file.txt copy.txt',     expectedOutput: '' },
      { title: 'rm and find',       orderIndex: 4, type: 'mission', xpReward: 50, description: 'Remove files and find them.',                       command: 'find . -name "*.txt"',     expectedOutput: '' },
      { title: 'File Inspection',   orderIndex: 5, type: 'mission', xpReward: 60, description: 'Inspect files with cat, head, tail.',               command: 'cat /etc/os-release',      expectedOutput: '' },
      { title: 'World 2 Boss',      orderIndex: 6, type: 'boss',    xpReward: 150, description: 'Master the filesystem hierarchy.',                  command: '', expectedOutput: '' },
    ],
  },
  {
    id: 3,
    name: 'Text Processing',
    orderIndex: 3,
    unlockRequirement: 5,
    missions: [
      { title: 'grep basics',       orderIndex: 1, type: 'mission', xpReward: 60, description: 'Search files with grep.',                           command: 'grep "root" /etc/passwd', expectedOutput: '' },
      { title: 'sed & awk',         orderIndex: 2, type: 'mission', xpReward: 60, description: 'Transform text with sed and awk.',                  command: 'echo "hello world" | sed "s/world/linux/"', expectedOutput: 'hello linux' },
      { title: 'sort & uniq',       orderIndex: 3, type: 'mission', xpReward: 60, description: 'Sort and deduplicate text.',                        command: 'sort /etc/passwd | uniq',  expectedOutput: '' },
      { title: 'cut & paste',       orderIndex: 4, type: 'mission', xpReward: 60, description: 'Extract columns with cut.',                         command: 'cut -d: -f1 /etc/passwd',  expectedOutput: '' },
      { title: 'World 3 Boss',      orderIndex: 5, type: 'boss',    xpReward: 175, description: 'Chain text processing tools.',                      command: '', expectedOutput: '' },
    ],
  },
  {
    id: 4,
    name: 'Permissions',
    orderIndex: 4,
    unlockRequirement: 4,
    missions: [
      { title: 'chmod basics',      orderIndex: 1, type: 'mission', xpReward: 60, description: 'Change file permissions.',                          command: 'chmod 755 script.sh',      expectedOutput: '' },
      { title: 'chown & chgrp',     orderIndex: 2, type: 'mission', xpReward: 60, description: 'Change file ownership.',                            command: 'chown user:group file.txt', expectedOutput: '' },
      { title: 'Octal modes',       orderIndex: 3, type: 'mission', xpReward: 70, description: 'Use numeric permission modes.',                     command: 'chmod 644 file.txt',       expectedOutput: '' },
      { title: 'umask',             orderIndex: 4, type: 'mission', xpReward: 70, description: 'Understand and set umask.',                         command: 'umask',                    expectedOutput: '' },
      { title: 'World 4 Boss',      orderIndex: 5, type: 'boss',    xpReward: 175, description: 'Apply complex permission schemes.',                 command: '', expectedOutput: '' },
    ],
  },
  {
    id: 5,
    name: 'Processes',
    orderIndex: 5,
    unlockRequirement: 4,
    missions: [
      { title: 'ps and top',        orderIndex: 1, type: 'mission', xpReward: 70, description: 'View running processes.',                           command: 'ps aux',                   expectedOutput: '' },
      { title: 'kill & signals',    orderIndex: 2, type: 'mission', xpReward: 70, description: 'Send signals to processes.',                        command: 'kill -9 1234',             expectedOutput: '' },
      { title: 'Background jobs',   orderIndex: 3, type: 'mission', xpReward: 70, description: 'Run jobs in the background.',                       command: 'sleep 10 &',               expectedOutput: '' },
      { title: 'nice & priority',   orderIndex: 4, type: 'mission', xpReward: 75, description: 'Control process priority.',                         command: 'nice -n 10 sleep 5',       expectedOutput: '' },
      { title: 'World 5 Boss',      orderIndex: 5, type: 'boss',    xpReward: 200, description: 'Debug a stuck process scenario.',                   command: '', expectedOutput: '' },
    ],
  },
  {
    id: 6,
    name: 'Networking',
    orderIndex: 6,
    unlockRequirement: 4,
    missions: [
      { title: 'ping & curl',       orderIndex: 1, type: 'mission', xpReward: 75, description: 'Test network connectivity.',                        command: 'ping -c 4 google.com',     expectedOutput: '' },
      { title: 'ssh basics',        orderIndex: 2, type: 'mission', xpReward: 75, description: 'Connect via SSH.',                                  command: 'ssh user@host',            expectedOutput: '' },
      { title: 'netstat & ss',      orderIndex: 3, type: 'mission', xpReward: 75, description: 'Inspect network connections.',                      command: 'ss -tulpn',                expectedOutput: '' },
      { title: 'dig & nslookup',    orderIndex: 4, type: 'mission', xpReward: 80, description: 'Query DNS records.',                                command: 'dig google.com',           expectedOutput: '' },
      { title: 'World 6 Boss',      orderIndex: 5, type: 'boss',    xpReward: 200, description: 'Diagnose a network issue.',                         command: '', expectedOutput: '' },
    ],
  },
  {
    id: 7,
    name: 'Shell Scripting',
    orderIndex: 7,
    unlockRequirement: 4,
    missions: [
      { title: 'Your first script', orderIndex: 1, type: 'mission', xpReward: 80, description: 'Write and execute a shell script.',                 command: 'bash script.sh',           expectedOutput: '' },
      { title: 'Variables & loops', orderIndex: 2, type: 'mission', xpReward: 80, description: 'Use variables and for loops.',                      command: 'for i in 1 2 3; do echo $i; done', expectedOutput: '' },
      { title: 'Conditionals',      orderIndex: 3, type: 'mission', xpReward: 80, description: 'Use if/else in scripts.',                           command: 'if [ -f file ]; then echo yes; fi', expectedOutput: '' },
      { title: 'Functions & args',  orderIndex: 4, type: 'mission', xpReward: 85, description: 'Define and call functions.',                        command: '',                         expectedOutput: '' },
      { title: 'World 7 Boss',      orderIndex: 5, type: 'boss',    xpReward: 225, description: 'Write a real automation script.',                   command: '', expectedOutput: '' },
    ],
  },
  {
    id: 8,
    name: 'System Administration',
    orderIndex: 8,
    unlockRequirement: 4,
    missions: [
      { title: 'systemd basics',    orderIndex: 1, type: 'mission', xpReward: 90, description: 'Manage services with systemctl.',                   command: 'systemctl status',         expectedOutput: '' },
      { title: 'journalctl',        orderIndex: 2, type: 'mission', xpReward: 90, description: 'Read system logs.',                                 command: 'journalctl -n 50',         expectedOutput: '' },
      { title: 'cron jobs',         orderIndex: 3, type: 'mission', xpReward: 90, description: 'Schedule tasks with cron.',                         command: 'crontab -l',               expectedOutput: '' },
      { title: 'Firewall rules',    orderIndex: 4, type: 'mission', xpReward: 100, description: 'Configure ufw firewall.',                           command: 'ufw status',               expectedOutput: '' },
      { title: 'World 8 Boss',      orderIndex: 5, type: 'boss',    xpReward: 250, description: 'Harden a fresh Linux server.',                      command: '', expectedOutput: '' },
    ],
  },
];

async function main() {
  console.log('🐧 Seeding Tux Tutor database…');

  for (const worldData of WORLDS) {
    const { missions, ...worldFields } = worldData;

    // Upsert world
    const world = await prisma.world.upsert({
      where: { id: worldFields.id },
      update: { name: worldFields.name, orderIndex: worldFields.orderIndex, unlockRequirement: worldFields.unlockRequirement },
      create: worldFields,
    });

    console.log(`  ✓ World ${world.orderIndex}: ${world.name}`);

    // Upsert missions for this world
    for (const missionData of missions) {
      const missionId = (worldFields.id - 1) * 10 + missionData.orderIndex;
      await prisma.mission.upsert({
        where: { id: missionId },
        update: {
          title: missionData.title,
          description: missionData.description,
          type: missionData.type,
          xpReward: missionData.xpReward,
          orderIndex: missionData.orderIndex,
          command: missionData.command,
          expectedOutput: missionData.expectedOutput,
        },
        create: {
          id: missionId,
          worldId: world.id,
          title: missionData.title,
          description: missionData.description,
          type: missionData.type,
          xpReward: missionData.xpReward,
          orderIndex: missionData.orderIndex,
          command: missionData.command,
          expectedOutput: missionData.expectedOutput,
        },
      });
    }

    console.log(`    └─ Seeded ${missions.length} missions`);
  }

  console.log('\n✅ Seed complete!');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
