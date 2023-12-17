export const HTML = `
<!DOCTYPE html>
<html lang="en-GB">
    <head>
        <meta charset="utf-8">
        <title>EKVG TWI - Turbulence Warning Indication System</title>
        <meta name="viewport" content="width=750px">
        <link rel="stylesheet" href="https://cdn.olli.ovh/twi.olli.ovh/styles/main.css">
    </head>
    <body class="loading">
        <div class="indicators-wrap">
            <div id="loader" class="spinner"></div>

            <div class="indicators-box">
                <div class="indicators">
                    <div id="arr-rwy-30" class="indicator">
                        <h3>ARR RWY 30</h3>
                        <p></p>
                    </div>
                    <div id="dep-rwy-30" class="indicator">
                        <h3>DEP RWY 30</h3>
                        <p></p>
                    </div>
                </div>
                <p class="indicators-identifier">RUNWAY 30</p>
            </div>

            <div class="indicators-box">
                <div class="indicators">
                    <div id="arr-rwy-12" class="indicator">
                        <h3>ARR RWY 12</h3>
                        <p></p>
                    </div>
                    <div id="dep-rwy-12" class="indicator">
                        <h3>DEP RWY 12</h3>
                        <p></p>
                    </div>
                </div>
                <p class="indicators-identifier">RUNWAY 12</p>
            </div>
            
            <p id="metar"></p>
        </div>

        <hr />

        <h1>Turbulence Warning Indication (TWI) System</h1>
        <p>This is the TWI system for EKVG Vagar Airport on the <a href="https://vatsim.net" target="_blank">VATSIM</a> network.</p>
        <p>The TWI system uses data collected by the real-world operators of Vagar to predict the severity of turbulence on final approach. This software's dataset is based on the windroses published on the Danish AIP.</p>
        
        <hr />

        <h2>Using This System</h2>
        <p>The TWI system predicts turbulent conditions individually for both departures and arrivals.</p>
        <p>If the winds are gusting, the highest speed will be used. If the winds are variable, the system will display the worst case scenario. This is what they will follow in real life.</p>
        <p>
            <strong>NONE:</strong> No substantial turbulence is predicted.
            <br />
            <strong class="color-light">LIGHT:</strong> Light turbulence is predicted. Light aircraft should still be able to fly relatively safely.
            <br />
            <strong class="color-medium">MEDIUM:</strong> Moderate turbulence is predicted. The flight of light aircraft is very difficult.
            <br />
            <strong class="color-heavy">HEAVY:</strong> Moderate to severe turbulence is predicted. The flight of light aircraft is hazardous and the flight of larger aircraft is very difficult. Larger aircraft may be very near, or past, their crosswind limits.
            <br />
            <strong class="color-severe">SEVERE:</strong> Severe turbulence is predicted. Take-off and landing in the indicated configuration is prohibited.
        </p>
        <p><strong>Note:</strong> TWI closes runways for take-offs and landings separately. This means a runway could be closed for take-offs, but available for landings, or vice-versa.</p>
        <p>This page will automatically refresh every 10 minutes. Every 2 hours, you will need to confirm you are still using the system.</p>

        <hr />

        <h2>How It Works</h2>
        <p>Over 30 years, the operators of Vagar have collected data and pilot reports which have allowed them to create multiple 'windroses' (charts that show turbulence severity in relation to wind heading and speed). These are used to program the real-world TWI and are the basis of this system as well.</p>
        <p>In real life, the TWI operates on a degree-by-degree basis, but this system uses 10 degree increments due to its use of METARs instead of direct access to a weather station. The real-world TWI also takes into account variations and gust frequency however, I do not have access to this data.</p>

        <h3>Arriving RWY 30, Departing RWY 12</h3>
        <div class="img-sim-wrap">
            <img src="https://cdn.olli.ovh/twi.olli.ovh/images/arr30-dep12.png" alt="Windrose showing turbulance severity for arrivals to runway 30, and departures from runway 12" />
        </div>

        <h3>Arriving RWY 12, Departing RWY 30</h3>
        <div class="img-sim-wrap">
            <img src="https://cdn.olli.ovh/twi.olli.ovh/images/arr12-dep30.png" alt="Windrose showing turbulance severity for arrivals to runway 12, and departures from runway 30" />
        </div>

        <hr />

        <p><strong>FOR SIMULATION USE ONLY</strong></p>

        <p>
            Provided and maintained by Ollie - 1553864
            <br />
            Discord: <a href="https://discord.com/channels/@me/534479985855954965">olli.ovh</a> or <a href="https://discord.com/channels/182554696559362048/207181274044039169">#icelandic-chat</a>
        </p>

        <span id="refreshing-in"></span>

        <script src="https://cdn.olli.ovh/twi.olli.ovh/scripts/main.js"></script>
    </body>
</html>
`;
