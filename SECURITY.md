# Security Policy

## Supported Versions

Security updates are provided for the latest released version of this package. Older versions are unlikely to receive fixes, so please upgrade first before reporting — unless the issue only affects an older release.

## Reporting a Vulnerability

Please don't report security issues through public GitHub issues, discussions, pull requests, Reddit, or anywhere else public.

Use GitHub's private vulnerability reporting feature instead. If that's not available, reach out to the maintainer directly through the repository contact details.

## What to Include

The more detail you can provide, the better:

- affected package version
- platform and environment
  - React Native version
  - Android and/or iOS version
  - device or simulator
- a clear description of the issue
- steps to reproduce
- proof of concept or sample project if you have one
- your assessment of the impact
- whether the issue requires special configuration, permissions, or malformed input

## Scope

This covers vulnerabilities in the package itself:

- JavaScript or TypeScript source
- Android native code
- iOS native code
- example or demo code, if it poses a realistic risk

A few things worth noting:

- a Google Maps API key leaking from your app is almost always an integration issue on the app side, not a bug in this package
- misconfigurations or insecure usage in downstream apps are generally out of scope, unless the package actively makes that misuse easy or unsafe by default
- if the issue is in a third-party dependency, it may need to be reported upstream too

## Disclosure

Once a report comes in, I'll review it, figure out the impact, and work on a fix if needed. Please hold off on going public until a fix is out and people have had time to update.

## Security Updates

Fixes ship as a new package version and get noted in the releases or changelog.
