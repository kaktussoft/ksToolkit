// mainly report definitions to create nice html output. For details see https://dev.to/ron_clarijs/create-data-reports-using-javascript-function-15dc
// made by Ron Clarijs (ron.clarijs@gmail.com), visit https://www.kaktussoft.nl
import * as kstoolkit from '//cdn.jsdelivr.net/gh/kaktussoft/ksToolkit@latest/js/ksToolkit.js';

// report definitions
const defaultGrouping = kstoolkit.GroupBy(['Rooster', 'TafelNaam']);
export const reportCompetitiestand = {
    source: data => data.records,
    headers:
        [
            '<h1 style="page-break-after:avoid">Competitiestand</h1><div style="display:inline-block">',
            (_record, objWork) =>
                `<table class="table table-sm table-nonfluid table-striped table-bordered table-hover" style="text-align:right">
                    <thead class="bg-info text-white">
                        <tr style="text-align:center">
                            <th colspan="2" style="font-size:1.3em">Seizoen ${objWork.rawData.Seizoen}</th>
                            ${objWork.rawData.Tafels.map(e => `<th colspan="2">Te maken<br>${kstoolkit.htmlSanitize(e.TafelNaam)} biljart</th>`).join('')}
                            ${objWork.rawData.Tafels.map(e => `<th colspan="2">Gespeeld<br>${kstoolkit.htmlSanitize(e.TafelNaam)} biljart</th>`).join('')}
                            ${objWork.rawData.Tafels.map(e => `<th colspan="2">Geschat volgend rooster<br>${kstoolkit.htmlSanitize(e.TafelNaam)} biljart</th>`).join('')}
                            <th colspan="2" style="font-size:1.3em">BV 't Waagje</th>
                        </tr>
                        <tr>
                            <th>Pl</th><th style="text-align:left">Speler</th>
                            ${objWork.rawData.Tafels.map(() => '<th>Moy</th><th>Car</th>').join('')}
                            ${objWork.rawData.Tafels.map(() => '<th>Part</th><th>Pnt</th>').join('')}
                            ${objWork.rawData.Tafels.map(() => '<th>Moy</th><th>Car</th>').join('')}
                            <th>Part</th><th>Pnt</th>
                        </tr>
                    </thead>
                    <tbody>`
        ],
    footers:
        [
            '</div>',
            (_record, objWork) =>
                `</tbody></table>
                <div style="width: 100%; height: 6px; background: repeating-linear-gradient(45deg, #17a2b8, #17a2b8 10px, #ffc107 10px, #ffc107 20px)"></div>
                <div style="break-inside:avoid">${kstoolkit.createOutput(reportStatistieken)(objWork.rawData.statistieken)}</div>`
        ],
    display: (record, objWork) =>
        `<tr>
            <td>${record.Pl}</td>
            <td style="white-space:nowrap;text-align:left"><span class="spelerLink ${record.Actief === '0' ? 'text-danger' : ''}">${kstoolkit.htmlSanitize(record.SpelersNaam)}</span></td>       
            ${objWork.rawData.Tafels.map(e => `<td>${record[`Moy${e.ID}`].replace(/\./g, ',')}</td><td>${record[`Car${e.ID}`]}</td>`).join('')}
            ${objWork.rawData.Tafels.map(e => `<td>${record[`AantalPar${e.ID}`].replace(/\./g, ',')}</td><td>${record[`sumPartijP${e.ID}`]}</td>`).join('')}
            ${objWork.rawData.Tafels.map(e => `<td>${record[`GMoy${e.ID}`].replace(/\./g, ',')}</td><td>${record[`GCar${e.ID}`]}</td>`).join('')}
            <td>${record.AantalParTot}</td><td>${record.PartijPTot}</td>
        </tr>`
};
export const reportStatistieken = {
    headers:
        [
            '<h4>Statistieken:</h4>',
            '<table class="table table-sm" style="width:0;min-width:min(100%,100dvw)"><tbody>'
        ],
    footers: ['', '</tbody></table>'],
    display: record =>
        `<tr class="border-top-color_red">
            <td><span${record.isStandaardRooster === '1' ? ' class="text-info"' : ''}><b>Huidige nummer 1 R${record.Rooster} ${kstoolkit.htmlSanitize(record.TafelNaam)}</b></span></td>
            <td>${record.Nummer1.split('|').map(e => `<span class="spelerLink" style="white-space:nowrap">${kstoolkit.htmlSanitize(e)}</span>`).join('<br>')}</td>
            <td><span${record.isStandaardRooster === '1' ? ' class="text-info"' : ''}><b>Huidige hoogste serie R${record.Rooster} ${kstoolkit.htmlSanitize(record.TafelNaam)}</b></span></td>
            <td>${record.SpelerHS.split('|').map(e => `<span class="spelerLink" style="white-space:nowrap">${kstoolkit.htmlSanitize(e)}</span>`).join('<br>')}</td>
            <td style="text-align:right">${record.HS}</td>
        </tr>`
};
export const reportStand = {
    compare: defaultGrouping,
    headers:
        [
            '<h1 style="page-break-after:avoid">Stand</h1>',
            record => `<h2 class="text-danger">Rooster ${record.Rooster}</h2>`,
            record =>
                `<div style="break-inside:avoid">
                    <h4>Tafel ${kstoolkit.htmlSanitize(record.TafelNaam)}</h4>
                    <div class="table-responsive" style="break-inside:avoid">
                        <table class="table table-sm table-nonfluid table-striped table-bordered table-hover" style="text-align:right">
                            <thead class="bg-info text-white">
                                <tr style="text-align:center">
                                    <th colspan="2"></th><th colspan="2">Te maken</th><th colspan="2">Gespeeld</th>
                                    <th colspan="7">Statistieken</th><th colspan="2">Partijen</th>
                                </tr>
                                <tr>
                                    <th>Pl</th><th style="text-align:left">Speler</th><th>Moy</th><th>Car</th><th>Moy</th><th>Car</th><th>Car</th>
                                    <th>Brt</th><th>HSerie</th><th>KPartij</th><th>LPartij</th><th>HMoy</th><th>LMoy</th><th>Aantal</th><th>Pnt</th>
                                </tr>
                            </thead>
                            <tbody>`
        ],
    footers: ['', '', '</tbody></table></div></div>'],
    display: record =>
        `<tr>
            <td>${record.Pl}</td>
            <td style="white-space:nowrap;text-align:left"><span class="spelerLink ${record.Actief === '0' ? 'text-danger' : ''}">${kstoolkit.htmlSanitize(record.SpelersNaam)}</span></td>
            <td>${record.Moyenne.replace(/\./g, ',')}</td><td>${record.Car}</td><td>${record.GespMoy.replace(/\./g, ',')}</td><td>${record.newCar}</td>
            <td>${record.sumCar}</td><td>${record.sumBeurten}</td><td>${record.maxHS}</td><td>${record.minBeurten}</td><td>${record.maxBeurten}</td>
            <td>${record.maxMoy.replace(/\./g, ',')}</td><td>${record.minMoy.replace(/\./g, ',')}</td><td>${record.AantalPar}</td><td>${record.sumPartijP}</td>
        </tr>`
};
export const reportNogTeSpelen = {
    compare: defaultGrouping,
    headers:
        [
            '<h1 style="page-break-after:avoid">Nog te spelen partijen</h1>',
            record => `<h2 class="text-danger">Rooster ${record.Rooster}</h2>`,
            record =>
                `<div style="break-inside:avoid">
                    <h4>Tafel ${kstoolkit.htmlSanitize(record.TafelNaam)}</h4>
                    <table class="table table-sm table-nonfluid table-striped table-bordered table-hover fontsmall">
                        <thead class="bg-info text-white">
                            <tr><th>Speler</th><th style="text-align:right">Aantal</th><th>Spelerslijst</th></tr>
                        </thead>
                        <tbody>`
        ],
    footers: ['', '', '</tbody></table></div>'],
    display: record =>
        `<tr>
            <td style="white-space:nowrap"><span class="spelerLink">${kstoolkit.htmlSanitize(record.SpelersNaam)}</span></td>
            <td style="text-align:right">${record.Aantal}</td>
            <td>${record.TeSpelenLijst.split('|').map(e => `<span style="white-space:nowrap">${kstoolkit.htmlSanitize(e)}</span>`).join(', ')}</td>
        </tr>`
};
export const reportMatrix = {
    init: objWork => {
        objWork.matrixHeader = '';
        const firstRecord = objWork.rawData[0];
        for (const record of objWork.rawData) {
            if (defaultGrouping(firstRecord, record) !== -1) break;
            objWork.matrixHeader += `<th class="vertical-text" style="vertical-align:top">${kstoolkit.htmlSanitize(record.S1naam)}</th>`;
        }
    },
    compare: defaultGrouping,
    headers:
        [
            '<h1 style="page-break-after:avoid">Matrixoverzicht</h1>',
            record => `<h2 class="text-danger">Rooster ${record.Rooster}</h2><div style="display:flex;flex-wrap:wrap;gap:1em">`,
            (record, objWork) =>
                `<div style="break-inside:avoid">
                    <h4>Tafel ${kstoolkit.htmlSanitize(record.TafelNaam)}</h4>
                    <table class="table table-sm table-nonfluid table-striped table-bordered table-hover" style="text-align:right">
                        <thead class="bg-info text-white">
                            <tr style="text-align:left">
                                <th>Speler</th><th style="text-align:right">#</th>${objWork.matrixHeader}
                            </tr>
                        </thead>
                        <tbody>`
        ],
    footers: ['', '</div>', '</tbody></table></div>'],
    display: record =>
        `<tr>
            <td style="white-space:nowrap;text-align:left"><span class="spelerLink ${record.Actief === '0' ? 'text-danger' : ''}">${kstoolkit.htmlSanitize(record.S1naam)}</span></td>
            <td style="color:red;">${record.Number}</td>
            ${record.results.split('|').reduce((acc, e) => acc + `<td>${e}</td>`, '')}
        </tr>`
};
export const reportSpelersLijst = {
    headers: ['<div id="SpelerLijst"><button type="button" class="btn btn-sm btn-primary mb-2 ks_klikbaar">Allemaal</button> '],
    footers: ['</div><div id="output2"></div>'],
    display: record => `<button type="button" class="btn btn-sm btn-info mb-2 ks_klikbaar">${kstoolkit.htmlSanitize(record.SpelersNaam)}</button> `
};
export const reportOptionSpelers = {
    display: record => `<option>${kstoolkit.htmlSanitize(record.SpelersNaam)}</option>`
};
export const reportOptionTafels = {
    display: record => `<option>${kstoolkit.htmlSanitize(record.TafelNaam)}</option>`
};
export const reportOptionTafelsMoyupd = {
    display: record => `<option data-subtext='rooster ${record.Standaardrooster}'>${kstoolkit.htmlSanitize(record.TafelNaam)}</option>`
};
export const reportOptionSpelersMoyupd = {
    display: record => `<option data-subtext='${record.AantalPartijen} par'>${kstoolkit.htmlSanitize(record.SpelersNaam)}</option>`
};
export const reportSpelersDetails = {
    source: data => data.records,
    compare: defaultGrouping,
    headers:
        [
            (_record, objWork) => `<h1 style="page-break-after:avoid">Uitslagen - ${kstoolkit.htmlSanitize(objWork.rawData.speler)}</h1>`,
            record => `<h2 class="text-danger">Rooster ${record.Rooster}</h2>`,
            record =>
                `<div style="break-inside:avoid">
                    <h4>Tafel ${kstoolkit.htmlSanitize(record.TafelNaam)}</h4>
                    <div class="table-responsive">
                        <table class="table table-sm table-nonfluid table-striped table-bordered table-hover fontsmall" style="text-align: right">
                            <thead class="bg-info text-white">
                                <tr style="text-align: center"><th></th><th colspan="4">Speler1</th><th colspan="4">Speler2</th><th colspan="2"></th></tr>
                                <tr>
                                    <th style="text-align:left">Datum</th><th style="text-align:left">Naam</th><th>Car</th><th>HS</th><th>Moy</th>
                                    <th style="text-align:left">Naam</th><th>Car</th><th>HS</th><th>Moy</th>
                                    <th>Brt</th><th style="text-align:center">Uits</th>
                                </tr>
                            </thead>
                            <tbody>`
        ],
    footers: ['', '', '</tbody></table></div></div>'],
    display: record =>
        `<tr>
            <td style="text-align:left">${record.DatumF}</td>
            ${['1', '2'].reduce((acc, e) =>
            acc + `<td style="white-space:nowrap;text-align:left">${kstoolkit.htmlSanitize(record[`Speler${e}`])} (${record[`CarTeMaken${e}`]})</td>
                <td>${record[`Car${e}`]}</td>
                <td>${record[`HS${e}`]}</td>
                <td>${record[`Moy${e}`].replace(/\./g, ',')}</td>`, '')}
            <td>${record.Beurten}</td>
            <td style="text-align:center">${record.PartijP1}-${record.PartijP2}</td>
        </tr>`
};
// Information reports (nothing yet)

// other data
export const invoerForm =
    `<form class="form-inline">
        <div class="form-group mx-1 mb-1">       
            <input name="datum" type="text" class="form-control" style="width:7em" placeholder="datum">
        </div>
        <div class="form-group mx-1 mb-1">
            <select name="tafel" data-title="Selecteer tafel"></select>
        </div>
        <div class="form-group mx-1 mb-1">
            <input name="Rooster" type="text" class="form-control" style="width:3em" placeholder="rst">
        </div>
        <div class="form-group mx-1 mb-1"> 
            <select name="spelerN1" data-title="Selecteer speler"></select>
        </div>
        <div class="form-group mx-1 mb-1">
            <input name="Car1" type="text" class="form-control" style="width:3em" placeholder="car">
        </div>
        <div class="form-group mx-1 mb-1">
            <input name="HS1" type="text" class="form-control" style="width:3em" placeholder="hs">
        </div>
        <div class="form-group mx-1 mb-1">       
            <select name="spelerN2" data-title="Selecteer speler"></select>
        </div>
        <div class="form-group mx-1 mb-1">
            <input name="Car2" type="text" class="form-control" style="width:3em" placeholder="car">
        </div>
        <div class="form-group mx-1 mb-1">
            <input name="HS2" type="text" class="form-control" style="width:3em" placeholder="hs">
        </div>
        <div class="form-group mx-1 mb-1">
            <input name="Beurten" type="text" class="form-control" style="width:3em" placeholder="brt">
        </div>
        <div class="form-group mx-1 mb-1">
            <input name="wachtwoord" type="password" placeholder="wachtwoord" class="form-control" style="width:8em">
        </div>
        <div class="form-group mx-1 mb-1">
            <button type="submit" class="btn btn-info">Opslaan</button>
        </div>
    </form>
    <div id="invoerStatus">
    </div>`;