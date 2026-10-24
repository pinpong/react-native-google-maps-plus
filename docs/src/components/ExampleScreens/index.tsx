import useBaseUrl from '@docusaurus/useBaseUrl';

import {
  type Platform,
  platformName,
  platforms,
  screenshotUrl,
} from '../ExampleGrid';

import styles from './styles.module.css';

function Screen({
  platform,
  id,
  alt,
}: {
  platform: Platform;
  id: string;
  alt: string;
}) {
  return (
    <figure className={styles.screen}>
      <img
        src={useBaseUrl(screenshotUrl(platform, id))}
        alt={`${alt}, on ${platformName(platform)}`}
        width={600}
        height={800}
      />
      <figcaption>{platformName(platform)}</figcaption>
    </figure>
  );
}

// The iOS and Android screenshot of an example side by side.
export default function ExampleScreens({
  id,
  alt,
}: {
  id: string;
  alt: string;
}) {
  return (
    <div className={styles.screens}>
      {platforms.map((platform) => (
        <Screen key={platform} platform={platform} id={id} alt={alt} />
      ))}
    </div>
  );
}
