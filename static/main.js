(() => {
    const lastConfirmedNotAFK = Date.now();

    window.addEventListener('load', () => {
        refreshData();
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
})();
