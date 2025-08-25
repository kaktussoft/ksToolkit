export { createOutput, GroupBy, transferData, processResponsePromise, getServerDataMakeReportPutInElem, htmlSanitize} from '//cdn.jsdelivr.net/gh/kaktussoft/ksToolkit@latest/js/ksToolkit.js';
export const navEvent = (e, navEventListener) => {
    e.preventDefault();
    // find active link in the navigation bar and make it NOT active anymore
    document.querySelector('.navbar-nav .nav-link.active')?.classList.remove('active');
    e.currentTarget.classList.add('active');
    navEventListener(e);
};
export const weekPlayDay = dayOfWeek => {
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
export const embedFile = async file => {
    const response = await fetch(file);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.text();
};
