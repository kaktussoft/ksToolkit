// for details see https://dev.to/ron_clarijs/create-data-reports-using-javascript-function-15dc
// createOutput function made by Ron Clarijs (ron.clarijs@gmail.com)
export const createOutput = (reportDefinition, objWorkOrig = {}) => inputData => {
    // compare: compare function. (function arguments are previous record and current record).
    // display: function that displays the record (function argument is current record).
    // footers: array of footers. Footer can be a function (function argument is previous record).
    // headers: array of headers. Header can be a function (function argument is current record).
    // objWork: extra object passed to compare, display, headers, footers, init and source.
    // headers and footers have a third argument. It is the relative breakpoint to 'groupLevel'.
    // source is function to preprocess inputData.
    const objWork = { ...objWorkOrig, rawData: inputData };
    const { compare = () => -1, display, footers = [], headers = [], init = () => { }, source = data => data } = reportDefinition;
    const generateSeparator = (record, separator, splitPosition) => (typeof separator === 'function') ? separator(record, objWork, splitPosition) : separator;
    init(objWork);
    const records = source(inputData, objWork);
    const report = records.reduce((acc, currentRecord, index) => {
        const isFirstRecord = index === 0;
        const previousRecord = records[index - 1];
        const groupLevel = isFirstRecord ? 0 : compare(previousRecord, currentRecord, objWork);
        const isLastRecord = index === records.length - 1;
        const isNewGroup = groupLevel !== -1;
        if (isNewGroup) {
            // only display footer if not first record
            // if so, footer begins at level groupLevel. Of course in reverse order
            if (!isFirstRecord) {
                // Header or Footer functions: separator will be invoked with third argument 0 if this is header/footer belonging to groupLevel.
                // third argument will be 1 for the next header/footer that is triggered automatically. Possibly there are more
                // headers/footers... they get 2, 3, and so on as third argument
                for (let i = footers.length - 1; i >= groupLevel; i--) {
                    acc += generateSeparator(previousRecord, footers[i], i - groupLevel);
                }
            }
            // header begins at level groupLevel
            for (let i = groupLevel; i < headers.length; i++) {
                acc += generateSeparator(currentRecord, headers[i], i - groupLevel);
            }
        }
        acc += display(currentRecord, objWork);
        // if last element, display all footers. Of course in reverse order
        if (isLastRecord) {
            for (let i = footers.length - 1; i >= 0; i--) {
                acc += generateSeparator(currentRecord, footers[i], i);
            }
        }
        return acc;
    }, '');
    return report;
};
// helper function for reportDefinition compare function
export const GroupBy = (fields, level = 1) => (prv, cur) => {
    const index = fields.findIndex(field => cur[field] !== prv[field]);
    return (index === -1) ? -1 : index + level;
};
export const transferData = async (url, mode, data = '', requestOptions = {}) => {
    // use 'new URLSearchParams(data)' to convert plain javascript object to data we want
    // use 'new FormData(formElem)' to convert form to data we want (only method POST)
    // use 'new URLSearchParams(new FormData(formElem))' to convert form to data we want (method GET/POST)
    // default options are marked with *
    const defaultOptions = {
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    };
    const modeOptions = {
        POST: {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            body: data
        },
        GET: {
            method: 'GET' // *GET, POST, PUT, DELETE, etc.
        }
    };
    const options = { ...defaultOptions, ...modeOptions[mode], ...requestOptions };
    return fetch(url + ((mode === 'GET' && data !== '') ? ('?' + data) : ''), options).then(response => [response, null]).catch(err => [null, err]);
};
export const processResponsePromise = ([response, err]) => {
    if (err) {
        throw err;
    }
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response.json();
};
export const getServerDataMakeReportPutInElem = async (fetchUrl, reportCfg, Elem, queryString = '', showLoader = true, method = 'GET') => {
    if (showLoader) {
        Elem.innerHTML = `<button class="btn btn-primary" type="button" disabled>
                                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Loading...
                                        </button>`;
    }
    const data = await transferData(fetchUrl, method, queryString).then(processResponsePromise);
    Elem.innerHTML = createOutput(reportCfg)(data) || 'Geen records gevonden!';
};
export const navEvent = (e, navEventListener) => {
    e.preventDefault();
    // find active link in the navigation bar and make it NOT active anymore
    document.querySelector('.navbar-nav .nav-link.active')?.classList.remove('active');
    e.currentTarget.classList.add('active');
    navEventListener(e);
};
export const htmlSanitize = elem => elem.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
