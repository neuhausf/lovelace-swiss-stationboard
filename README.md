[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

# swiss-stationboard
Custom lovelace card for Home Assistant Lovelace UI.  
Swiss public transport stationboard. Shows connections from one or multiple stations.

![Stationboard "Schüpfen"](https://github.com/neuhausf/lovelace-swiss-stationboard/blob/main/img/stationboard-1.png?raw=true "Stationboard Schüpfen")

## Information

_**Warning:** Requires https://github.com/neuhausf/swiss-public-transport-mod to be installed first._  
Note that the current implementation is based on https://pypi.org/project/python-opendata-transport/ which currently doesn't return *delays* (property is there, but the underlying API-call to transport.opendata.ch may not always provide them).

## Configuration

- Go to HACS
- Add a custom repo: https://github.com/neuhausf/lovelace-swiss-stationboard
- Install the lovelace card

Add a new custom card to your Dashboard:

```YAML
type: custom:swiss-stationboard
name: Abfahrt
hide_title: true
platform_filter: 21
category: B|^ICE$|S
name_replacement:
  Aeroporto: Airprt
  Malpensa: Malp
platform_name: Gl.
entity:
  - sensor.schupfen
```

### Card settings

* `departure_offset`: optional number of minutes (defaults to 0). Hides next departures within this window.
* `departure_countdown`: optional minutes (defaults to 15). Departures in this window show a countdown.
* `show_seconds`: show seconds in the countdown when true.
* `entity`: the sensor (from *swiss-public-transport-mod*) used as data source.
* `hide_title`: hides the card title when true.
* `name_replacement`: replace destination names (see examples below).
* `category`: optional regex to filter by category (e.g. `B|^ICE$|S`).
* `platform_filter`: optional regex to filter platforms (e.g. `3|21`).
* `show_last_changed`: shows when the underlying data last changed.
* `minutes_label`: string for minutes in ETA (defaults to ` min`/` mins`).
* `seconds_label`: string for seconds in ETA (defaults to `″`).
* `line_colors`: mapping to override the line background color per line. Keys are the displayed line text (e.g. `S3`, `IR68`) or regex-keys written as strings starting and ending with `/` (for example `/^S\\d+/`). Values are CSS colors (`#RRGGBB`, `rgb()`, color names). Only `background-color` is overridden; other styles remain.

Short example:
```yaml
type: 'custom:swiss-stationboard'
entity: sensor.sbb_stationboard_<id>
line_colors:
  S3: "#1E90FF"
  IR68: "#FF8800"
  "/^S\\d+/": "#2d327d"
```

### Text replacement 
#### Exact text replacement

Replaces occurrences in the destination name (e.g., `journey.to`). Matching is **literal**.

```yaml
type: custom:swiss-stationboard
name: Departures
hide_title: true
platform_filter: 21
category: B|^ICE$|S
platform_name: Pl.
name_replacement:
  Aeroporto: Airprt
  Malpensa: Malp
entity:
  - sensor.schupfen
```

#### Advanced format: list of replacement rules

Also supported as a list of rules (ordered):

```yaml
name_replacement:
  - from: Aeroporto
    to: Airprt
  - from: Malpensa
    to: Malp
```

#### Notes

* Replacements are applied globally (all occurrences).
* Matching is case-sensitive by default.

## Privacy 

This integration uses:

- https://github.com/agners/swiss-public-transport-card 
- the changes made in the pull request by @agners: https://github.com/home-assistant/core/pull/30715
- and some own code to adapt the visualization.
