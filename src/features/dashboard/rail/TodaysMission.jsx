// Icons: lucide-react only — do not mix libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Play } from 'lucide-react';
import Button from '../../../components/ui/Button';
import styles from './TodaysMission.module.css';

/**
 * TodaysMission — burgundy block with the day's next mission and a Start button.
 *
 * @param {{ id: number, title: string, worldName: string, xpReward: number }|null} mission
 */
export default function TodaysMission({ mission }) {
  const navigate = useNavigate();
  if (!mission) return null;

  const { title, worldName, xpReward } = mission;

  return (
    <section
      className={styles.block}
      aria-label="Today's mission"
    >
      <div className={styles.overline}>
        <Target size={13} strokeWidth={2} aria-hidden="true" />
        <span>Today's Mission</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.world}>{worldName}</p>
      <div className={styles.footer}>
        <span className={styles.xp} aria-label={`${xpReward} XP reward`}>
          +{xpReward} XP
        </span>
        <Button
          variant="primary"
          aria-label={`Start mission: ${title}`}
          onClick={() => navigate(`/missions/${mission.id}`)}
        >
          <Play size={14} strokeWidth={2} aria-hidden="true" />
          <span>Start mission</span>
        </Button>
      </div>
    </section>
  );
}
