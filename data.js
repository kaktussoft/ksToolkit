import * as lib from '/common/library.js';
//report definitions
export const reportStand = {
    compare: lib.GroupBy(['ClubNaam']),
    headers:
        [
            '',
            record =>
                `<h1>${lib.htmlSanitize(record.ClubNaam)}</h1>
                <div class="table-responsive">
                    <table class="table table-sm table-nonfluid table-striped table-bordered table-hover fontsmall">
                        <thead class="bg-info text-white">
                            <tr>
                                <th colspan="2"></th><th colspan="2" style="text-align:center">Te maken</th><th colspan="2" style="text-align:center">Gespeeld</th>
                                <th colspan="7" style="text-align:center">Statistieken</th><th colspan="2" style="text-align:center">Partijen</th>
                            </tr>
                            <tr>
                                <th>Pl</th><th>Speler</th><th>Moy</th><th>Car</th><th>Moy</th><th>Car</th><th>Car</th><th>Beurten</th><th>HSerie</th>
                                <th>KPartij</th><th>LPartij</th><th>HMoy</th><th>LMoy</th><th>Aantal</th><th>Pnt</th>
                            </tr>
                        </thead>
                        <tbody>`
        ],
    footers: ['', '</tbody></table></div>'],
    display: record =>
        `<tr>
            <td style="text-align:right">${record.plaats}</td>
            <td><span class="spelerLink">${lib.htmlSanitize(record.SpelersNaam)}</span></td><td style="text-align:right">${record.Moyenne.replace(/\./g, ',')}</td>
            <td style="text-align:right">${record.Car}</td><td style="text-align:right">${record.GespMoy.replace(/\./g, ',')}</td><td style="text-align:right">${record.newCar}</td>
            <td style="text-align:right">${record.sumCar}</td><td style="text-align:right">${record.sumBeurten}</td><td style="text-align:right">${record.maxHS}</td>
            <td style="text-align:right">${record.minBeurten}</td><td style="text-align:right">${record.maxBeurten}</td><td style="text-align:right">${record.maxMoy.replace(/\./g, ',')}</td>
            <td style="text-align:right">${record.minMoy.replace(/\./g, ',')}</td><td style="text-align:right">${record.AantalPar}</td><td style="text-align:right">${record.sumPartijP}</td>
        </tr>`
};
export const reportSpelersLijst = {
    compare: lib.GroupBy(['ClubNaam']),
    headers: [
        '<div id="SpelerLijst"><p class="mb-1"><button type="button" class="btn btn-sm btn-primary mb-2 ks_klikbaar">Allemaal</button></p>',
        record => `<p class="mb-1">${record.ClubNaam}: `
    ],
    footers: ['</div>', '</p>'],
    display: record => `<button type="button" class="btn btn-sm btn-info mb-2 ks_klikbaar">${lib.htmlSanitize(record.SpelersNaam)}</button> `
};
const specialBackgroundColor = '#FFBBBB';
export const reportSpelersDetails = {
    headers:
        [
            `<div class="table-responsive">
                <table class="table table-sm table-nonfluid table-striped table-bordered table-hover fontsmall">
                    <thead class="bg-info text-white">
                        <tr>
                            <th colspan="1"></th><th colspan="5" style="text-align: center">Speler1</th><th colspan="5" style="text-align: center">Speler2</th>
                            <th colspan="2"></th></tr><tr><th>Datum</th><th>Clubnaam</th><th>Naam</th><th>Car</th><th>HS</th><th>Moy</th><th>Clubnaam</th>
                            <th>Naam</th><th>Car</th><th>HS</th><th>Moy</th><th>Brt</th><th>Uits</th>
                        </tr>
                    </thead>
                    <tbody>`
        ],
    footers: ['</tbody></table></div>'],
    display: record =>
        `<tr class="cursor-pointer"${record.Verzet === '1' ? ` style="background-color:${specialBackgroundColor}"` : ''} data-id="${record.ID}" data-toggle="modal" data-target="#PartijUitslag">
            <td>${record.DatumF}</td>
            ${['1', '2'].reduce((acc, e) => acc + `<td>${lib.htmlSanitize(record[`ClubNaam${e}`])}</td>
                <td>${lib.htmlSanitize(record[`Speler${e}`])} (${record[`CarTeMaken${e}`]})</td>
                <td style="text-align:right">${record[`Car${e}`]}</td>
                <td style="text-align:right">${record[`HS${e}`]}</td>
                <td style="text-align:right">${record[`Moy${e}`].replace(/\./g, ',')}</td>`, '')}
            <td style="text-align:right">${record.Beurten}</td><td style="text-align:center">${record.PartijP1}-${record.PartijP2}</td>
        </tr>`
};
//other data
export const SpelersDetailsLegend = `<div class="mb-1"><span style="background-color:${specialBackgroundColor}">Partij is veranderd!</span></div>`;
//define radio buttons for filtering SpelersDetails
export const SpelersDetailsFilter =
    `<div id="SpelersDetailsFilter">
        <input type="radio" id="SDF1" name="SpelersDetailsFilter" value="1" checked><label for="SDF1">Alle partijen</label>
        <input type="radio" id="SDF2" name="SpelersDetailsFilter" value="2"><label for="SDF2">Alleen reeds ingevoerde uitslagen</label>
        <input type="radio" id="SDF3" name="SpelersDetailsFilter" value="3"><label for="SDF3">Alleen NIET ingevoerde uitslagen</label>
    </div>`;
//define welcome page
export const welcomePage = `<div class="mt-1"><img src="/common/DeKlos.jpg" style="max-width:100%"></div>`;
export const finalePage = (() => {
    const head = '<h1>Finale</h1>';
    const finaleTr =
        `<tr>
            <td>09-11-2024</td><td>BC Carillon</td><td></td><td style="text-align:right"></td><td style="text-align:right"></td><td style="text-align:right"></td>
            <td>De Klos</td><td></td><td style="text-align:right"></td><td style="text-align:right"></td><td style="text-align:right"></td>
            <td style="text-align:right"></td><td style="text-align:center"></td>
        </tr>`;
    return `${head}${reportSpelersDetails.headers[0]}${finaleTr}${reportSpelersDetails.footers[0]}`;
})();
//define game rules
export const rulesPage =
    `<ul>
        <li>Aanvang 19:30</li>
        <li>Te maken caramboles is 55 maal moyenne</li>
        <li>Maximaal 60 beurten</li>
        <li>Winnaar van trekstoot maakt uit wie er gaat beginnen</li>
        <li>Indien nodig is er een nabeurt</li>
        <li>Winnaar krijgt 2 punten en verliezer 0 punten. Bij gelijkspel allebei 1 punt</li>
        <li>Indien beide spelers niet uit zijn, wint degene die het hoogste percentage van zijn te maken caramboles heeft gemaakt</li>
        <li>Positie in (tussen)stand is afhankelijk van aantal partijpunten (aflopend), aantal partijen (oplopend), "te maken caramboles"/"gespeeld moyenne" (oplopend)</li>
    </ul>`;
//define modal PartijUitslag
export const PartijUitslagModal =
    `<div class="modal fade" id="PartijUitslag" tabindex="-1" role="dialog" aria-labelledby="PartijUitslagLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <form>
                    <div class="modal-header">
                        <h5 class="modal-title" id="PartijUitslagLabel">Modal title</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th colspan="2"></th>
                                    <th>Car</th>
                                    <th>Hserie</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td name="Partijdata_Speler1" colspan="2"></td>
                                    <td><input name="Partijdata_ID" type="hidden"><input name="Partijdata_Car1" class="form-control form-control-sm" type="number" style="width:4em"></td>
                                    <td><input name="Partijdata_HS1" class="form-control form-control-sm" type="number" style="width:4em"></td>
                                </tr>
                                <tr>
                                    <td name="Partijdata_Speler2" colspan="2"></td>
                                    <td><input name="Partijdata_Car2" class="form-control form-control-sm" type="number" style="width:4em"></td>
                                    <td><input name="Partijdata_HS2" class="form-control form-control-sm" type="number" style="width:4em"></td>
                                </tr>
                                <tr>
                                    <td><b>Beurten:</b></td>
                                    <td><input name="Partijdata_Beurten" class="form-control form-control-sm" type="number" style="width:4em"></td>
                                    <td colspan="2"><input name="Partijdata_password" placeholder="Vul Wachtwoord in" class="form-control form-control-sm" type="password"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="mb-0 alert modalMessage"></div>                
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Annuleren</button>
                        <button type="submit" class="btn btn-primary">Opslaan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
