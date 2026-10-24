import { useEffect, useState } from 'react';

import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import ExampleGrid from '../components/ExampleGrid';
import anchors from '../generated/anchors.json';
import snippets from '../generated/snippets.json';

import styles from './index.module.css';

const installCommand =
  'yarn add react-native-google-maps-plus react-native-nitro-modules';

const features = [
  {
    title: 'Markers',
    text: 'Classic, draggable and advanced markers with info windows, pins and glyphs.',
  },
  {
    title: 'SVG markers',
    text: 'Any SVG string as marker icon, rendered natively in C++ by lunasvg.',
  },
  {
    title: 'Shapes',
    text: 'Polylines, polygons with holes and circles, each with tap events.',
  },
  {
    title: 'Heatmaps, KML and tiles',
    text: 'Weighted heatmaps with custom gradients, KML layers and URL tile overlays.',
  },
  {
    title: 'Street View',
    text: 'A Street View panorama with camera control and panorama events.',
  },
  {
    title: 'Location',
    text: 'Location updates, compass heading, permission status and the system dialogs.',
  },
  {
    title: 'Camera and snapshots',
    text: 'Animate the camera, fit coordinates or bounds and capture the map as an image.',
  },
  {
    title: 'Styles',
    text: 'JSON map styles, map IDs, dark mode, traffic, transit and indoor levels.',
  },
];

const quickstart = `import { GoogleMapsView } from 'react-native-google-maps-plus';

export default function App() {
  return (
${(snippets[0]?.code ?? '')
  .split('\n')
  .map((line) => `    ${line}`)
  .join('\n')}
  );
}`;

// The guide used to be one page, keep its anchors working.
function useLegacyAnchorRedirect() {
  const guidesUrl = useBaseUrl('/docs/guides/');
  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    const page = (anchors as Record<string, string>)[anchor];
    if (!page) return;
    window.location.replace(
      `${guidesUrl}${page}${anchor === page ? '' : `#${anchor}`}`
    );
  }, [guidesUrl]);
}

function InstallCommand() {
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.install}>
      <code>{installCommand}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(installCommand).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function Home() {
  useLegacyAnchorRedirect();
  return (
    <Layout
      title="Native Google Maps for React Native"
      description="Map and Street View components for React Native on top of the official Google Maps SDKs, built on Nitro Modules."
    >
      <main>
        <header className={clsx('container', styles.hero)}>
          <h1>
            React Native
            <br />
            Google Maps Plus
          </h1>
          <p className={styles.lead}>
            Map and Street View components on top of the official Google Maps
            SDKs for iOS and Android, built on Nitro Modules.
          </p>
          <div className={styles.actions}>
            <Link
              className={clsx(styles.button, styles.buttonPrimary)}
              to="/docs/guides/installation"
            >
              Get started
            </Link>
            <Link className={styles.button} to="/docs/api">
              API reference
            </Link>
          </div>
          <InstallCommand />
        </header>

        <section className="container">
          <ExampleGrid group="use-cases" />
          <p className={styles.more}>
            <Link to="/docs/examples">All examples</Link>, including KML layers,
            tile overlays, clustering, indoor maps and snapshots.
          </p>
        </section>

        <section className={clsx('container', styles.split)}>
          <div>
            <h2>Features</h2>
            <p>
              Overlays are props of <code>GoogleMapsView</code>, user
              interactions are callbacks and the camera is moved with methods on
              the ref.
            </p>
          </div>
          <dl className={styles.features}>
            {features.map((feature) => (
              <div key={feature.title}>
                <dt>{feature.title}</dt>
                <dd>{feature.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={clsx('container', styles.split)}>
          <div>
            <h2>Quickstart</h2>
            <ol className={styles.steps}>
              <li>
                Install <code>react-native-google-maps-plus</code> and{' '}
                <code>react-native-nitro-modules</code>.
              </li>
              <li>
                Set up the Google Maps SDKs and API keys for iOS and Android.
              </li>
              <li>
                Add <code>GoogleMapsView</code> to a screen.
              </li>
            </ol>
            <Link to="/docs/guides/installation">
              Read the installation guide
            </Link>
          </div>
          <CodeBlock language="tsx" title="App.tsx">
            {quickstart}
          </CodeBlock>
        </section>
      </main>
    </Layout>
  );
}
