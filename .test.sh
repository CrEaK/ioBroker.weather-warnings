npm run lint && npm run build:ts && rm /tmp/test-iobroker.weather-warnings/* -r && npm run test:integration | grep "error:\|warn:\|passing\|Test:\|User-defined\|The adapter starts"