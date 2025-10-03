# React Native Google Maps Plus – Example App

This is the **example application** for [`react-native-google-maps-plus`](https://github.com/yourname/react-native-google-maps-plus).
It demonstrates how to set up and run the package on **Android** and **iOS**.

---

## Prerequisites

- Make sure you have completed the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment).
- You will need a valid **Google Maps API Key** from the [Google Cloud Console](https://console.cloud.google.com/).

---

## Step 1: Add Google Maps API Key

Create the required secrets files and add your API key:

```sh
echo MAPS_API_KEY="<YOUR_MAPS_API_KEY>" >> android/secrets.properties
echo MAPS_API_KEY="<YOUR_MAPS_API_KEY>" >> ios/Secrets.xcconfig
```
