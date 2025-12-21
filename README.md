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

* `departure_offset`: an optional number of X minutes (defaults to 0).  If greater than zero minutes, it hides all next departures within those minutes.  Note that the filtering is on the frontend only - so this could lead to an empty stationboard if the sensor doesn't provide enough journeys (`limit` setting of the [stationboard-sensor](https://github.com/neuhausf/swiss-public-transport-mod))
* `departure_countdown`: an optional number of minutes (defaults to 15).  All departures within this time window will have a countdown displayed onscreen.
* `show_seconds`: if true, will show seconds in addition to minutes within the countdown.
* `entity`: which entity (from *swiss-public-transport-mod*) to use as the data source.
* `hide_title`: hides the title if true.
* `name_replacement`: Replaces destination by custom text. 
* `category`: optional regular expression to filter by categories (S-train, Bus, ICE, ...).  i.e. to include multiple categories use the OR operator: `category: B|^ICE$|S`
* `platform_filter`: optional regular expression to filter by platforms (3, 21, ...).  i.e. to include multiple platforms use the OR operator: `platform_filter: 3|21`
* `show_last_changed`: if true, shows the last time that the underlying data changed.
* `minutes_label`: the string denoting minutes in the ETA field.  Defaults to ` min` or ` mins` depending on how many minutes are left.  Note the whitespace before the word — if your chosen string does not have whitespace, the string will be stuck to the number.
* `seconds_label`: the string denoting seconds in the ETA field.  Defaults to `″`.  Note the whitespace before the word — if your chosen string does not have whitespace, the string will be stuck to the number.

### Text replacement 
#### Exact text replacement

Replaces occurrences in the destination name (e.g., `journey.to`). Matching is **literal** (special characters are treated as normal characters).

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

#### Replacement with spaces and special characters (literal match)

If your search text contains spaces, `*`, `:`, `#`, etc., wrap it in quotes (YAML best practice).

```yaml
type: custom:swiss-stationboard
name: Departures
hide_title: true
name_replacement:
  "xyz with som*e special chars ...": "xyz short"
  "Airport Terminal 1": "T1"
entity:
  - sensor.schupfen
```

#### Advanced format: list of replacement rules

Same feature as the mapping object, but expressed as a list (useful if you want to keep a specific order or extend later).

```yaml
type: custom:swiss-stationboard
name: Departures
hide_title: true
name_replacement:
  - from: Aeroporto
    to: Airprt
  - from: Malpensa
    to: Malp
entity:
  - sensor.schupfen
```

#### Alternative list format (tuples)

A compact list syntax (each rule is a 2-item array).

```yaml
type: custom:swiss-stationboard
name: Departures
hide_title: true
name_replacement:
  - ["Aeroporto", "Airprt"]
  - ["Malpensa", "Malp"]
entity:
  - sensor.schupfen
```

#### Notes

* Replacements are applied **globally** (all occurrences in the destination string).
* Matching is **case-sensitive** by default (e.g., `malpensa` won’t match `Malpensa`).
* Replacement keys are treated as **literal text** (no wildcard/regex behavior).

## Privacy 

This integration uses:

- https://github.com/agners/swiss-public-transport-card 
- the changes made in the pull request by @agners: https://github.com/home-assistant/core/pull/30715
- and some own code to adapt the visualization.
