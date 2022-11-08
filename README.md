[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

# swiss-stationboard
Custom lovelace card for Home Assistant Lovelace UI.
Swiss public transport stationboard. Shows connections from one or multiple stations. 

![Stationboard "Schüpfen"](https://github.com/neuhausf/lovelace-swiss-stationboard/blob/main/img/stationboard-1.png?raw=true "Stationboard Schüpfen")

## Information

_**Warning:** Requires https://github.com/neuhausf/swiss-public-transport-mod to be installed first._
Note that the current implementation is based on https://pypi.org/project/python-opendata-transport/ which currently doesn't return *delays* (property is there, but  the underlying API-call to transport.opendata.ch doesn't return anything).

## Configuration

- Go to HACS
- Add a custom repo: https://github.com/neuhausf/lovelace-swiss-stationboard
- Install the lovelace card

Add a new custom card to your Dashboard:

```YAML
type: custom:swiss-stationboard
name: Abfahrt
hide_title: true
platform_name: Gl.
entity:
  - sensor.schupfen
```

### Card settings

* `departure_offset`: an optional number of X minutes (defaults to 0).  If greater than zero minutes, it hides all next departures within those minutes.  Note that the filtering is on the frontend only - so this could lead to an empty stationboard if the sensor doesn't provide enough journeys (`limit` setting of the [stationboard-sensor](https://github.com/neuhausf/swiss-public-transport-mod))
* `departure_countdown`: an optional number of minutes (defaults to 15).  All departures within this time window will have a countdown displayed onscreen.
* `show_seconds`: if true, will show seconds in addition to minutes within the countdown.
* `entity`: which entity (from *swiss-public-transport-mod*) to use as the data source.
* `hide_title`: hides the title if true.
* `show_last_changed`: if true, shows the last time that the underlying data changed.

## Privacy 

This integration uses:

- https://github.com/agners/swiss-public-transport-card 
- the changes made in the pull request by @agners: https://github.com/home-assistant/core/pull/30715
- and some own code to adapt the visualization.
