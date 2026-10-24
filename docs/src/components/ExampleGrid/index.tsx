import { useState } from 'react';

import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

import examples from '../../generated/examples.json';

import styles from './styles.module.css';

export type Platform = 'ios' | 'android';

export const platforms: Platform[] = ['ios', 'android'];

export const platformName = (platform: Platform) =>
  platform === 'ios' ? 'iOS' : 'Android';

export const screenshotUrl = (platform: Platform, id: string) =>
  `/img/screens/${platform}/${id}.webp`;

function Tile({
  platform,
  example,
}: {
  platform: Platform;
  example: (typeof examples)[number];
}) {
  return (
    <Link
      className={styles.tile}
      to={`/docs/examples/${example.group}/${example.id}`}
    >
      <img
        src={useBaseUrl(screenshotUrl(platform, example.id))}
        alt={example.alt}
        width={600}
        height={800}
        loading="lazy"
      />
      <strong>{example.title}</strong>
      <span className={styles.props}>
        {example.props.map((prop) => (
          <code key={prop}>{prop}</code>
        ))}
      </span>
    </Link>
  );
}

// The examples of a group as tiles, with a switch between the iOS and Android
// screenshots.
export default function ExampleGrid({ group }: { group: string }) {
  const [platform, setPlatform] = useState<Platform>('ios');
  return (
    <div>
      <div className={styles.platforms} role="group" aria-label="Platform">
        {platforms.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={platform === p}
            onClick={() => setPlatform(p)}
          >
            {platformName(p)}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {examples
          .filter((example) => example.group === group)
          .map((example) => (
            <Tile key={example.id} platform={platform} example={example} />
          ))}
      </div>
    </div>
  );
}
