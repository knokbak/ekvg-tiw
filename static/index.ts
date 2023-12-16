export const HTML = `
<!DOCTYPE html>
<html lang="en-GB">
    <head>
        <meta charset="utf-8">
        <title>EKVG TWI - Turbulence Warning Indication System</title>
        <meta name="viewport" content="width=750px">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fira+Code&family=Open+Sans:wght@400;500;600;700&display=swap');

            :root {
                --background: #24242e;
                --none: #2a2a36;
                --light: #4e4eec;
                --medium: #00c800;
                --heavy: #c2c209;
                --severe: #ff0000;
            }

            body {
                font-family: 'Open Sans', sans-serif;
                background: var(--background);
                color: #fff;
                margin: 0;
                padding: 30px;
            }

            h1 {
                margin: 0 0 16px;
            }

            p {
                margin: 0;
            }

            p:not(:last-child) {
                margin-bottom: 12px;
            }

            a {
                color: #43c6e7;
                text-decoration: underline;
                text-underline-offset: 2px;
                font-weight: 500;
            }

            hr {
                height: 1px;
                border: none;
                background: #5e5e6e;
                margin: 30px -30px;
            }

            .indicators {
                display: flex;
                flex-wrap: wrap;
                text-align: center;
                margin: 0 0 20px;
                padding: 13px;
                border: 1px solid #5e5e6e;
                border-radius: 8px;
            }

            .indicator {
                background: var(--none);
                flex: 0 1 calc(50% - 60px);
                padding: 15px;
                margin: 15px;
                background: #2a2a36;
                border-radius: 8px;
                box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
            }

            .indicator h3 {
                margin: 0 0 4px !important;
                font-size: 24px;
            }

            .indicator p {
                margin: 0 !important;
                font-size: 15px;
                font-weight: 600;
            }

            .indicator.light {
                background: var(--light);
            }

            .indicator.medium {
                background: var(--medium);
            }

            .indicator.heavy {
                background: var(--heavy);
            }

            .indicator.severe {
                background: var(--severe);
            }

            @keyframes spinner {
                to {
                    transform: rotate(360deg);
                }
            }

            .spinner:before {
                content: '';
                box-sizing: border-box;
                width: 20px;
                height: 20px;
                display: block;
                border-radius: 50%;
                border: 2px solid #59585e;
                border-top-color: #fff;
                animation: spinner .6s linear infinite;
            }

            .indicators-wrap {
                position: relative;
                min-height: 376px;
            }

            .indicators-box {
                position: relative;
                width: 100%;
            }

            .indicators-box .indicators-identifier {
                position: absolute;
                top: -8px;
                width: 114px;
                left: calc(50% - 57px);
                text-align: center;
                font-size: 16px;
                line-height: 16px;
                font-weight: 600;
                color: #e5e5e9;
                background: var(--background);
                padding: 0 2px;
            }

            #loader {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            #metar {
                font-family: 'Fira Code', monospace;
                padding: 12px;
                background: #2a2a36;
                border: 1px solid #5e5e6e;
                border-radius: 8px;
                font-size: 15px;
            }

            #refreshing-in {
                position: absolute;
                top: 5px;
                left: 5px;
                font-size: 12px;
                color: #5e5e6e;
            }

            body.loading .indicators-box, body.loading #metar, body.loading #refreshing-in, body:not(.loading) #loader {
                display: none;
            }
        </style>
    </head>
    <body class="loading">
        <div class="indicators-wrap">
            <div id="loader" class="spinner"></div>

            <div class="indicators-box">
                <div class="indicators">
                    <div id="arr-rwy-30" class="indicator light">
                        <h3>ARR RWY 30</h3>
                        <p>LIGHT TURBULENCE</p>
                    </div>
                    <div id="dep-rwy-30" class="indicator medium">
                        <h3>DEP RWY 30</h3>
                        <p>MEDIUM TURBULENCE</p>
                    </div>
                </div>
                <p class="indicators-identifier">RUNWAY 30</p>
            </div>

            <div class="indicators-box">
                <div class="indicators">
                    <div id="arr-rwy-12" class="indicator heavy">
                        <h3>ARR RWY 12</h3>
                        <p>HEAVY TURBULENCE</p>
                    </div>
                    <div id="dep-rwy-12" class="indicator severe">
                        <h3>DEP RWY 12</h3>
                        <p>TAKE-OFF PROHIBITED</p>
                    </div>
                </div>
                <p class="indicators-identifier">RUNWAY 12</p>
            </div>
            
            <p id="metar">EKVG 161720Z AUTO 26011KT 230V310 9999 BKN035/// BKN054/// 06/01 Q1010 RMK SCT031/// BKN062/// WIND SKEID 27016G39KT 220V310</p>
        </div>

        <hr />

        <h1>Turbulence Warning Indication (TWI) System</h1>
        <p>This is the TWI system for EKVG Vagar Airport on the <a href="https://vatsim.net" target="_blank">VATSIM</a> network.</p>
        <p>The TWI system uses data collected by the real-world operators of EKVG Vagar to predict the severity of turbulence on final approach. This software's dataset is based on the windroses published on the Danish AIP.</p>
        
        <hr />

        <h2>Using This System</h2>
        <p>The TWI system predicts turbulent conditions individually for both departures and arrivals.</p>
        <p>
            <strong>NONE:</strong> No substantial turbulence is predicted.
            <br />
            <strong style="color: var(--light)">LIGHT:</strong> Light turbulence is predicted. Light aircraft should still be able to fly relatively safely.
            <br />
            <strong style="color: var(--medium)">MEDIUM:</strong> Moderate turbulence is predicted. The flight of light aircraft is very difficult.
            <br />
            <strong style="color: var(--heavy)">HEAVY:</strong> Moderate to severe turbulence is predicted. The flight of light aircraft is hazardous and the flight of larger aircraft is very difficult. Larger aircraft may be very near, or past, their crosswind limits.
            <br />
            <strong style="color: var(--severe)">SEVERE:</strong> Severe turbulence is predicted. Take-off and landing in the indicated configuration is prohibited.
        </p>
        <p>This page will automatically refresh every 10 minutes. Every 2 hours, you will need to confirm you are still using the system.</p>

        <hr />

        <p>
            Provided and maintained by Ollie Killean - 1553864
            <br />
            Discord: <a href="https://discord.com/channels/@me/534479985855954965">olli.ovh</a> or <a href="https://discord.com/channels/182554696559362048/207181274044039169">#icelandic-chat</a>
        </p>

        <span id="refreshing-in"></span>

        <script>
            const lastConfirmedNotAFK = Date.now();

            window.addEventListener('load', () => {
                setTimeout(() => {
                    refreshData();
                }, 2_000);
            });

            function refreshData () {
                if (Date.now() - lastConfirmedNotAFK > 60_000 * 120) {
                    alert('Are you still here? Press OK to continue using the TWI system.');
                }

                document.body.classList.add('loading');

                fetch('/api/status', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then((x) => x.json()).then((data) => {
                    document.getElementById('arr-rwy-30').classList.remove('light', 'medium', 'heavy', 'severe');
                    document.getElementById('dep-rwy-30').classList.remove('light', 'medium', 'heavy', 'severe');
                    document.getElementById('arr-rwy-12').classList.remove('light', 'medium', 'heavy', 'severe');
                    document.getElementById('dep-rwy-12').classList.remove('light', 'medium', 'heavy', 'severe');

                    document.getElementById('arr-rwy-30').classList.add(data.warnings.arriving30);
                    document.getElementById('dep-rwy-30').classList.add(data.warnings.departing30);
                    document.getElementById('arr-rwy-12').classList.add(data.warnings.arriving12);
                    document.getElementById('dep-rwy-12').classList.add(data.warnings.departing12);

                    document.querySelector('#arr-rwy-30 p').innerText = toHumanReadable(data.warnings.arriving30);
                    document.querySelector('#dep-rwy-30 p').innerText = toHumanReadable(data.warnings.departing30);
                    document.querySelector('#arr-rwy-12 p').innerText = toHumanReadable(data.warnings.arriving12);
                    document.querySelector('#dep-rwy-12 p').innerText = toHumanReadable(data.warnings.departing12);

                    document.getElementById('metar').innerText = data.raw.metar;

                    let counter = 0;
                    let interval = setInterval(() => {
                        counter++;
                        if (counter === 600) {
                            clearInterval(interval);
                            refreshData();
                            return;
                        }
                        document.getElementById('refreshing-in').innerText = 'Refreshing in ' + (600 - counter) + ' seconds';
                    }, 1_000);

                    document.body.classList.remove('loading');
                }).catch((err) => {
                    alert(err);
                    throw err;
                });
            }

            function toHumanReadable (str) {
                switch (str) {
                    case 'none': return 'USE PERMITTED';
                    case 'light': return 'LIGHT TURBULENCE';
                    case 'medium': return 'MODERATE TURBULENCE';
                    case 'heavy': return 'HEAVY TURBULENCE';
                    case 'severe': return 'RUNWAY CLOSED';
                    default: throw new Error('Unknown turbulence level: ' + str);
                }
            }
        </script>
    </body>
</html>
`;
