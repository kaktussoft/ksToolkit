     import * as data from './data.js';
import * as lib from '/common/library.js';

let isFirstRun = true;
const urlParams = new URLSearchParams(window.location.search);
const baseElement = document.getElementById('ks_output');
document.getElementById('nav-item-1').addEventListener('click', e => {
    lib.navEvent(e, () => {
        baseElement.innerHTML = data.welcomePage;
        isFirstRun = false;
    });
});
document.getElementById('nav-item-2').addEventListener('click', e => {
    lib.navEvent(e, () => {
        lib.getServerDataMakeReportPutInElem('php/stand.php', data.reportStand, baseElement);
        isFirstRun = false;
    });
});
{
    let clickedPlayer = null;
    const partijUitslagen = 'nav-item-3';
    baseElement.addEventListener('click', e => {
        if (e.target.matches('span.spelerLink')) {
            clickedPlayer = e.target.textContent;
            document.getElementById(partijUitslagen).click();
        }
    });
    {
        let password = '';
        document.getElementById(partijUitslagen).addEventListener('click', e => {
            lib.navEvent(e, async () => {
                {
                    await lib.getServerDataMakeReportPutInElem('php/spelers_lijst.php', data.reportSpelersLijst, baseElement);
                    baseElement.querySelector('#SpelerLijst').addEventListener('click', e => {
                        if (e.target.matches('.ks_klikbaar')) {
                            // found the target. Make the pressed button class 'active'
                            e.currentTarget.querySelector('button.active')?.classList.remove('active');
                            e.target.classList.add('active');
                            lib.getServerDataMakeReportPutInElem('php/spelers_details.php', data.reportSpelersDetails,
                                baseElement.querySelector('#ks_output2'), new URLSearchParams({
                                    SpelersNaam: e.target.textContent, filtertype: baseElement.querySelector('[name="SpelersDetailsFilter"]:checked').value
                                }));
                        }
                    });
                }
                // add SpelersDetails Legend
                baseElement.insertAdjacentHTML("afterbegin", data.SpelersDetailsLegend);
                {
                    // add radio buttons for SpelersDetails filtering
                    baseElement.insertAdjacentHTML("beforeend", data.SpelersDetailsFilter);
                    baseElement.querySelector('#SpelersDetailsFilter').addEventListener('click', e => {
                        if (e.target.matches('input')) {
                            // click event on 'label' isn't needed!!
                            baseElement.querySelector('#SpelerLijst button.active')?.click();
                        }
                    });
                }
                // add container for Partij Details
                baseElement.insertAdjacentHTML("beforeend", '<div id="ks_output2"></div>');
                // add modal PartijUitslag to ks_output
                baseElement.insertAdjacentHTML("afterbegin", data.PartijUitslagModal);
                {
                    // modal stuff like fill it, show it, submit its form 
                    const partijUitslagModal = baseElement.querySelector('#PartijUitslag');
                    const partijUitslagModalForm = partijUitslagModal.querySelector('form');
                    // save password for later use
                    partijUitslagModalForm.querySelector('input[name="Partijdata_password"]').addEventListener('change', e => { password = e.currentTarget.value; });
                    partijUitslagModalForm.addEventListener('submit', async e => {
                        e.preventDefault();
                        const [postData, err] = await lib.transferData('php/partij_bijwerken.php', 'POST', new FormData(e.currentTarget));
                        if (err) {
                            throw err;
                        }
                        if (!postData.ok) {
                            throw new Error(postData.statusText);
                        }
                        const modalMessage = partijUitslagModal.querySelector('.modalMessage');
                        modalMessage.style.display = 'block';
                        const postAnswer = await postData.text();
                        if (postAnswer.substring(0, 1) !== ':') {
                            modalMessage.classList.add('alert-danger');
                            modalMessage.innerHTML = postAnswer;
                            return;
                        }
                        modalMessage.classList.remove('alert-danger');
                        modalMessage.classList.add('alert-success');
                        modalMessage.innerHTML = 'Uitslag succesvol ingevoerd/aangepast.';
                        // hide the modal after 1000ms
                        // await (new Promise(resolve => setTimeout(resolve, 1000)));
                        // $(partijUitslagModal).modal('hide');
                        baseElement.querySelector('#SpelerLijst button.active').click();
                    });
                    $(partijUitslagModal).on('show.bs.modal', async e => {
                        // clear all dynamic stuff to be sure that no old data will be displayed
                        e.currentTarget.querySelector('.modalMessage').style.display = 'none';
                        e.currentTarget.querySelector('.modal-title').innerHTML = '';

                        partijUitslagModalForm.querySelector('[name="Partijdata_Speler1"]').innerHTML = '';
                        partijUitslagModalForm.querySelector('[name="Partijdata_Speler2"]').innerHTML = '';
                        partijUitslagModalForm.querySelectorAll('input').forEach(element => { element.value = ''; });
                        // get the data from database
                        const [PartijdataFromDB, err] = await lib.transferData('php/partij_details.php', 'GET', new URLSearchParams({ ID: e.relatedTarget.dataset.id }));
                        if (err) {
                            throw err;
                        }
                        if (!PartijdataFromDB.ok) {
                            throw new Error(PartijdataFromDB.statusText);
                        }
                        {
                            const Partijdata = await PartijdataFromDB.json();
                            // inject retrieved data in correct spot in modal PartijUitslag
                            partijUitslagModal.querySelector('.modal-title').innerHTML = `ID: <b>${Partijdata.ID}</b> Datum: <b>${Partijdata.DatumF}</b>`;

                            partijUitslagModalForm.querySelector('[name="Partijdata_ID"]').value = Partijdata.ID;
                            partijUitslagModalForm.querySelector('[name="Partijdata_password"]').value = password;

                            partijUitslagModalForm.querySelector('[name="Partijdata_Speler1"]').innerHTML = `<b>${Partijdata.ClubNaam1} - ${Partijdata.Speler1} (${Partijdata.CarTeMaken1})<b>`;
                            partijUitslagModalForm.querySelector('[name="Partijdata_Car1"]').value = Partijdata.Car1;
                            partijUitslagModalForm.querySelector('[name="Partijdata_HS1"]').value = Partijdata.HS1;

                            partijUitslagModalForm.querySelector('[name="Partijdata_Speler2"]').innerHTML = `<b>${Partijdata.ClubNaam2} - ${Partijdata.Speler2} (${Partijdata.CarTeMaken2})<b>`;
                            partijUitslagModalForm.querySelector('[name="Partijdata_Car2"]').value = Partijdata.Car2;
                            partijUitslagModalForm.querySelector('[name="Partijdata_HS2"]').value = Partijdata.HS2;

                            partijUitslagModalForm.querySelector('[name="Partijdata_Beurten"]').value = Partijdata.Beurten;
                        }
                    });
                    $(partijUitslagModal).on('shown.bs.modal', e => {
                        partijUitslagModalForm.querySelector('input[name="Partijdata_Car1"]').focus();
                    });
                }
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
    };
}
document.getElementById('nav-item-4').addEventListener('click', e => {
    lib.navEvent(e, () => {
        baseElement.innerHTML = data.finalePage;
        isFirstRun = false;
    });
});
document.getElementById('nav-item-5').addEventListener('click', e => {
    lib.navEvent(e, () => {
        baseElement.innerHTML = data.rulesPage;
        isFirstRun = false;
    });
});
document.getElementById('nav-item-6').addEventListener('click', e => {
    e.preventDefault();
    window.open('documenten', '_blank');
    isFirstRun = false;
});
document.getElementById(urlParams.get('optie') ?? 'nav-item-1')?.click();
