// javascript code made by Ron Clarijs (ron.clarijs@gmail.com), visit https://www.kaktussoft.nl
import * as kstoolkit from '//cdn.jsdelivr.net/gh/kaktussoft/ksToolkit@latest/js/ksToolkit.js';
import * as dbdata from './data.js';

let isFirstRun = true;
const weekPlayDay = dayOfWeek => {
    // Sunday - Saturday : 0 - 6
    const lastPlayDate = new Date();
    const daysOffset = dayOfWeek - lastPlayDate.getDay();
    lastPlayDate.setDate(lastPlayDate.getDate() + (daysOffset + (daysOffset > 0 ? -7 : 0)));
    const dateFormatter = new Intl.DateTimeFormat('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    return dateFormatter.format(lastPlayDate);
};
const urlParams = new URLSearchParams(window.location.search);
const baseElement = document.getElementById('output');
document.getElementById('nav-item-1').addEventListener('click', e => {
    kstoolkit.navEvent(e, async () => {
        baseElement.innerHTML = await kstoolkit.embedFile('klant/welkom.txt');
        isFirstRun = false;
    });
});
document.getElementById('nav-item-2').addEventListener('click', e => {
    kstoolkit.navEvent(e, () => {
        kstoolkit.getServerDataMakeReportPutInElem('php/competitie_stand.php', dbdata.reportCompetitiestand, baseElement);
        isFirstRun = false;
    });
});
document.getElementById('nav-item-3').addEventListener('click', e => {
    kstoolkit.navEvent(e, () => {
        kstoolkit.getServerDataMakeReportPutInElem('php/stand.php', dbdata.reportStand, baseElement);
        isFirstRun = false;
    });
});
document.getElementById('nav-item-4').addEventListener('click', e => {
    kstoolkit.navEvent(e, () => {
        kstoolkit.getServerDataMakeReportPutInElem('php/tespelen.php', dbdata.reportNogTeSpelen, baseElement);
        isFirstRun = false;
    });
});
document.getElementById('nav-item-5').addEventListener('click', e => {
    kstoolkit.navEvent(e, () => {
        kstoolkit.getServerDataMakeReportPutInElem('php/tespelen_matrix.php', dbdata.reportMatrix, baseElement);
        isFirstRun = false;
    });
});
{
    let clickedPlayer = null;
    const partijUitslagen = 'nav-item-6';
    baseElement.addEventListener('click', e => {
        if (e.target.matches('span.spelerLink')) {
            clickedPlayer = e.target.textContent;
            document.getElementById(partijUitslagen).click();
        }
    });
    document.getElementById(partijUitslagen).addEventListener('click', e => {
        kstoolkit.navEvent(e, async () => {
            await kstoolkit.getServerDataMakeReportPutInElem('php/spelers_lijst.php', dbdata.reportSpelersLijst, baseElement);
            baseElement.querySelector('#SpelerLijst')?.addEventListener('click', e => {
                if (e.target.matches('.ks_klikbaar')) {
                    // found the target. Make the pressed button class 'active'
                    e.currentTarget.querySelector('button.active')?.classList.remove('active');
                    e.target.classList.add('active');
                    kstoolkit.transferData('php/spelers_details.php', 'GET', new URLSearchParams({ speler: e.target.textContent }))
                        .then(kstoolkit.processResponsePromise)
                        .then(kstoolkit.createOutput(dbdata.reportSpelersDetails))
                        .then(output => { baseElement.querySelector('#output2').innerHTML = output || 'geen records gevonden!'; });
                }
            });
            if (isFirstRun) {
                clickedPlayer = urlParams.get('speler');
            }
            if (clickedPlayer) {
                [...baseElement.querySelectorAll('#SpelerLijst button.ks_klikbaar')].find(e => e.textContent === clickedPlayer)?.click();
            }
            clickedPlayer = null;
            isFirstRun = false;
        });
    });
}
{
    let password = '';
    // Sunday - Saturday : 0 - 6
    let date;
    document.getElementById('nav-item-7').addEventListener('click', e => {
        kstoolkit.navEvent(e, async () => {
            const fetchJSON = (...arg) => kstoolkit.transferData(...arg).then(kstoolkit.processResponsePromise);
            const currentOption = e.currentTarget;
            baseElement.innerHTML = dbdata.invoerForm;
            const partijForm = baseElement.querySelector('form');
            const datumElem = partijForm.querySelector('input[name="datum"]');
            const wachtwoordElem = partijForm.querySelector('input[name="wachtwoord"]');
            const tafelElem = partijForm.querySelector('select[name="tafel"]');
            const spelerN1 = partijForm.querySelector('select[name="spelerN1"]');
            const spelerN2 = partijForm.querySelector('select[name="spelerN2"]');
            const roosterElem = partijForm.querySelector('input[name="Rooster"]');

            for (const e of partijForm.querySelectorAll('select')) {
                $(e).selectpicker();
            }
            const tafelData = await fetchJSON('php/tafels.php');
            {
                // fill the form
                datumElem.value = date ?? weekPlayDay(3);
                wachtwoordElem.value = password;
                tafelElem.innerHTML = kstoolkit.createOutput(dbdata.reportOptionTafels)(tafelData);
                $(tafelElem).selectpicker('refresh');
            }
            tafelElem.addEventListener('change', e => {
                roosterElem.value = tafelData.find(elem => elem.TafelNaam === e.currentTarget.value).Standaardrooster;
                roosterElem.dispatchEvent(new Event('change'));
            });
            const updateSelectPicker = async (fetchUrl, reportCfg, elem, queryString = '', method = 'GET') => {
                const elemOldValue = elem.value;
                const data = await fetchJSON(fetchUrl, method, queryString);
                elem.innerHTML = kstoolkit.createOutput(reportCfg)(data);
                $(elem).selectpicker('refresh');
                $(elem).selectpicker('val', elemOldValue);
            };
            roosterElem.addEventListener('change', async e => {
                await updateSelectPicker('php/speler_select.php', dbdata.reportOptionSpelers, spelerN1, new URLSearchParams({ tafel: tafelElem.value, rooster: e.currentTarget.value }));
                spelerN1.dispatchEvent(new Event('change'));
            });
            spelerN1.addEventListener('change', e => {
                updateSelectPicker('php/speler_select.php', dbdata.reportOptionSpelers, spelerN2, new URLSearchParams({ tafel: tafelElem.value, rooster: roosterElem.value, speler: e.currentTarget.value }));
            });
            // save date and password for later use
            datumElem.addEventListener('change', e => { date = e.currentTarget.value; });
            wachtwoordElem.addEventListener('change', e => { password = e.currentTarget.value; });
            tafelElem.focus();
            partijForm.addEventListener('submit', async e => {
                e.preventDefault();
                // clear previous message
                baseElement.querySelector('#invoerStatus').innerHTML = '';
                // send form data to server and get return code back
                const postAnswer = await fetchJSON('php/partij_voegtoe.php', 'POST', new FormData(e.currentTarget));
                if (postAnswer.error) {
                    baseElement.querySelector('#invoerStatus').innerHTML = `<span class="bg-warning">${postAnswer.error}</span>`;
                } else {
                    baseElement.querySelector('#invoerStatus').innerHTML = `<span class="bg-success text-white">${postAnswer.message}</span>`;
                    setTimeout(() => { currentOption.click(); }, 1000);
                }
            });
            isFirstRun = false;
        });
    });
}
document.getElementById('nav-item-8').addEventListener('click', e => {
    kstoolkit.navEvent(e, async () => {
        baseElement.innerHTML = await kstoolkit.embedFile('klant/informatie.txt');
        //lib.getServerDataMakeReportPutInElem('php/informatie1.php', dbdata.reportInformatie1, baseElement.querySelector('#infotxt_1'), new URLSearchParams({ speler: 'Donny Daam' }), "POST");
        //lib.getServerDataMakeReportPutInElem('php/informatie2.php', dbdata.reportInformatie2, baseElement.querySelector('#infotxt_2'), new URLSearchParams({ speler: 'Jan Mes' }), "POST");
        //lib.getServerDataMakeReportPutInElem('php/informatie3.php', dbdata.reportInformatie3, baseElement.querySelector('#infotxt_3'), new URLSearchParams({ speler: 'Bert Spaansen' }), "POST");
        isFirstRun = false;
    });
});
document.getElementById('nav-item-9').addEventListener('click', e => {
    e.preventDefault();
    window.open('documenten', '_blank');
    isFirstRun = false;
});
document.getElementById(urlParams.get('optie') ?? 'nav-item-1')?.click();
document.getElementById('koptekst').innerHTML = await kstoolkit.embedFile('klant/koptekst.txt');