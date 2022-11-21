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
      const destination = journey["to"];
      const exactname = journey["name"];

      const category = journey["category"];
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
        eta = "in ";
        eta += minutes + ((minutes > 1) ? " mins" : " min");
        if (this._config.show_seconds)
          eta += seconds + "″";
      }
      
      // allow category filtering by regex (S-Bahn, Bus, ...)
      var categoryRegexp = new RegExp(this._config.category || "");

      if (categoryRegexp.test(category) && absoluttotalseconds >= departure_offset) {
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
          platform: journey["platform"]
        });
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
