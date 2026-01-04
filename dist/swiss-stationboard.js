var LitElement =
  LitElement ||
  Object.getPrototypeOf(customElements.get("home-assistant-main"));
var html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class SwissPublicTransportCard extends LitElement {
  static get is() {
    return "swiss-stationboard";
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    const state = this.hass.states[this._config.entity];

    if (!state) {
      return html`
        <hui-warning
          >${this.hass.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }
    this._update_departures(state);
    return html`
      <ha-card id="hacard">
        ${this._config.hide_title
          ? html``
          : html`<div class="card-header">
          ${state.attributes.friendly_name}
          ${this._config.show_last_changed
            ? html`
            <div class="name">
              'N/A'
            </div>`
            : html``
          }`
        }     
         
        </div>
        <table>
          <tbody id="departuretable">
          ${this.departures.map(
            departure => html`
              <tr>
                <td class="shrink" style="text-align:left;">
                  <span
                    class="line ${departure.category}"
                    title="${departure.exactname}"
                    style="${this._getLineColorStyle(departure.linename)}"
                    >${departure.linename}</span
                  >
                </td>
                <td
                  class="shrink ${departure.delayed}"
                  style="text-align:right;"
                  data-departure="${departure.departure}"
                >
                  ${departure.departure_time}
                </td>
                <td class="expand ${departure.delayed}">${departure.destination}</td>
                <td
                  class="shrink ${departure.delayed}"
                  style="text-align:right;"
                >
                 ${departure.delay > 0?html`(+${departure.delay}')`:html``} ${departure.eta}&nbsp;
                </td>
                <td
                  class="shrink ${departure.delayed}"
                  style="text-align:right;"
                >
                ${departure.platform
                  ? html`
                  ${this._config.platform_name ? html`${this._config.platform_name}&nbsp`:html``}${departure.platform}`
                  : html``
                 }
                </td>
              </tr>
            `
          )}
          </tbody>
        </table>
      </ha-card>
    `;
  }

  static get properties() {
    return {
      header: { type: String },
      hass: {
        type: Object
      },
      departures: {
        type: Object
      },
      _config: {
        type: Object
      },
      showConfig: Boolean
    };
  }

  _update_departures(state) {
    var departures = [];
    const now = Date.now(); 

  //  this.last_changed = moment.duration(moment(state.last_changed).diff(now)).humanize(true);


    const departure_countdown = 60 * (this._config.departure_countdown === undefined ? 15 : this._config.departure_countdown);
    const departure_offset = 60 * (this._config.departure_offset === undefined ? 0 : this._config.departure_offset);

    if (!state.attributes["departures"]) {
      this.departures = [];
      return;
    }

    for (const journey of state.attributes["departures"]) {
      const destination = this._applyNameReplacements(journey["to"]);
      const exactname = journey["name"];

      // filter destinations according to config.destination_filter
      if (this._destinationMatchesFilter(destination)) {
        continue;
      }

      const category = journey["category"];
      const platform = journey["platform"];
      const linename =
        category +
        ((journey["number"] && journey["number"].startsWith(category)) ? "" : (journey["number"] || ""));

      const delay = journey["delay"];
      const delayed = delay > 1 ? "delayed" : "";
      const departure = new Date(journey["departure"]);

      // Format departure time in 24h format.
      const time = departure.toLocaleString('de-CH', { hour: 'numeric', minute: 'numeric'});// moment(departure).format("HH:mm");

      const totalseconds = Math.floor((now - departure) / 1000) - (delayed ? delay * 60 : 0);
      var eta = undefined;

      if (totalseconds > 0)
        continue;

      const absoluttotalseconds = Math.abs(totalseconds);
      if (absoluttotalseconds < departure_countdown)
      {
        const minutes = Math.floor(absoluttotalseconds / 60);
        const seconds = absoluttotalseconds % 60;
        eta = "in";
        var minsStr = (minutes > 1) ? " mins" : " min";
        minsStr = this._config.minutes_label ? this._config.minutes_label : minsStr;
        var secsStr = "″";
        var secsStr = this._config.seconds_label ? this._config.seconds_label : minsStr;
        eta += " " + minutes + minsStr;
        if (this._config.show_seconds)
          eta += " " + seconds + secsStr;
        // Corner case 0m 0s
        if (eta == "in")
          eta = "";
      }
      
      // allow category filtering by regex (S-Bahn, Bus, ...)
      var categoryRegexp = new RegExp(this._config.category || "");
      var plaformFilterRegexp = new RegExp(this._config.platform_filter || "");
      
      if (categoryRegexp.test(category) && plaformFilterRegexp.test(platform) && absoluttotalseconds >= departure_offset) {
        departures.push({
          linename: linename,
          exactname: exactname,
          departure_time: time,
          departure: departure,
          destination: destination,
          category: category,
          delay: delay,
          delayed: delayed,
          eta: eta,
          platform: platform
        });
      }
    }


    // Optional: limit how many rows are displayed (max_rows)
    const maxRowsCfg = this._config?.max_rows;
    if (maxRowsCfg !== undefined && maxRowsCfg !== null) {
      const maxRows = parseInt(maxRowsCfg, 10);
      if (!isNaN(maxRows) && maxRows > 0) {
        departures = departures.slice(0, maxRows);
      }
    }
    this.departures = departures;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this._config = config;
    this.departures = [];
  }

  getCardSize() {
    return 1;
  }

  firstUpdated(changedProperties) {
    if (this._config.show_seconds)
      setInterval(() => this.requestUpdate(), 1000);
    else
      setInterval(() => this.requestUpdate(), 10000);
  }
  
  _escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  }
  
  _applyNameReplacements(text) {
    if (text === undefined || text === null) return text;
  
    const cfg = this._config?.name_replacement;
    if (!cfg) return text;
  
    let result = String(text);
  
    // Variant: mapping object { "Aeroporto": "Airprt", ... }
    if (!Array.isArray(cfg) && typeof cfg === "object") {
      for (const [from, to] of Object.entries(cfg)) {
        if (from === "" || from === undefined || from === null) continue;
        const re = new RegExp(this._escapeRegExp(from), "g");
        result = result.replace(re, String(to ?? ""));
      }
      return result;
    }
  
    // Variant: list [{from,to}, ...] or [["from","to"], ...]
    if (Array.isArray(cfg)) {
      for (const rule of cfg) {
        if (!rule) continue;
  
        const from = rule.from ?? rule[0];
        const to = rule.to ?? rule[1];
  
        if (from === "" || from === undefined || from === null) continue;
        const isRegex = rule.regex === true;

        const re = isRegex
          ? new RegExp(from, rule.flags ?? "g")
          : new RegExp(this._escapeRegExp(from), "g");
        result = result.replace(re, String(to ?? ""));
      }
    }
  
    return result;
  }
  /**
   * Returns an inline style string for the line background color (background-color only),
   * based on the configuration this._config.line_colors.
   *
   * Supported config formats:
   * - Object mapping: { "S3": "#2d327d", "IR68": "#ff5500" }
   * - Regex keys: { "/^S\\d+/": "#123456" } (key must start and end with /)
   *
   * Returns: e.g. "background-color: #ff0000;" or an empty string if there is no override.
   */
  _getLineColorStyle(linename) {
    const cfg = this._config?.line_colors || this._config?.line_color || null;
    if (!cfg) return "";
    // Object mapping (most common case)
    if (typeof cfg === "object" && !Array.isArray(cfg)) {
      // Prefer direct matches
      if (Object.prototype.hasOwnProperty.call(cfg, linename) && cfg[linename]) {
        return `background-color: ${cfg[linename]};`;
      }
      // Check regex keys (keys provided as /.../)
      for (const key of Object.keys(cfg)) {
        if (!key || key.length < 2) continue;
        if (key.startsWith("/") && key.endsWith("/")) {
          try {
            const pattern = key.slice(1, -1);
            const re = new RegExp(pattern);
            if (re.test(linename)) {
              return `background-color: ${cfg[key]};`;
            }
          } catch (e) {
            // Invalid regex -> skip
          }
        }
      }
    }
    // No match
    return "";
  }
  /**
   * Checks whether a destination should be excluded via this._config.destination_filter.
   * destination_filter can be:
   * - String: exact match (case-sensitive) or regex string "/pattern/flags"
   * - Array of strings / regex strings
   * - RegExp object
   */
  _destinationMatchesFilter(destination) {
    if (destination === undefined || destination === null) return false;
    const cfg = this._config?.destination_filter;
    if (!cfg) return false;

    const checkItem = (item) => {
      if (item === undefined || item === null) return false;
      // if RegExp object
      if (item instanceof RegExp) {
        try {
          return item.test(String(destination));
        } catch (e) {
          return false;
        }
      }
      // string
      const s = String(item);
      if (s.length >= 2 && s.startsWith("/")) {
        // treat as regex with optional flags: /pattern/flags
        const lastSlash = s.lastIndexOf("/");
        if (lastSlash > 0) {
          const pattern = s.slice(1, lastSlash);
          const flags = s.slice(lastSlash + 1);
          try {
            const re = new RegExp(pattern, flags);
            return re.test(String(destination));
          } catch (e) {
            return false;
          }
        }
      }
      // exact match
      return String(destination) === s;
    };

    if (Array.isArray(cfg)) {
      for (const it of cfg) {
        if (checkItem(it)) return true;
      }
      return false;
    } else {
      return checkItem(cfg);
    }
  }

  static get styles() {
    return css`
      .name {
        line-height: normal;
        font-size: 16px;
        color: var(--secondary-text-color);
      }
      table {
        width: 100%;
        padding: 6px 14px;
      }
      td {
        padding: 3px 3px;
      }
      td.shrink {
        white-space: nowrap;
      }
      td.expand {
        width: 99%;
      }
      td.delayed {
        color: #f00;
      }
      span.line {
        font-weight: bold;
        font-size: 0.9em;
        padding: 1px 3px 1px;
        display: block;
        text-align: center;
        background-color: #888;
        margin-right: 0.0em;
      }
      span.S {
        color: #fff;
        border: solid 1px #ccc;
        background-color: #2d327d;
      }
      span.RE {
        color: #fff;
        border: solid 1px #ccc;
        background-color: #eb0000;
      }
      span.IR {
        color: #fff;
        border: solid 1px #ccc;
        background-color: #eb0000;
      }
      span.IC {
        color: #fff;
        border: solid 1px #ccc;
        background-color: #eb0000;
      }
      span.T {
        color: #fff;
        border: solid 1px #ccc;
        background-color: #009d3a;
      }
      span.B {
        color: #000;
        border: solid 1px #ccc;
        background-color: #fff;
      }
    `;
  }
}

customElements.define("swiss-stationboard", SwissPublicTransportCard);
