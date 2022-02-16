[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

# swiss-stationboard
Custom lovelace card for Home Assistant Lovelace UI.
Swiss public transport stationboard. Shows connections from one or multiple stations. 
![Stationboard "Schüpfen"](https://github.com/neuhausf/lovelace-swiss-stationboard/blob/main/img/stationboard-1.png?raw=true "Stationboard Schüpfen")

## Information

_**Warning:** Requires https://github.com/neuhausf/swiss-public-transport-mod to be installed first._

## Configuration

- Go to HACS
- Add a custom repo: https://github.com/neuhausf/lovelace-swiss-stationboard
- Install the lovelace card

Add a new custom card to your Dashboard:

```YAML
type: custom:swiss-stationboard
name: Abfahrt
entity:
  - sensor.schupfen
```

## Privacy 

This integration uses:

- https://github.com/agners/swiss-public-transport-card 
- the changes made in the pull request by @agners: https://github.com/home-assistant/core/pull/30715
- and some own code to adapt the visualization.