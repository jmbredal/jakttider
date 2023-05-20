import { format, getDayOfYear, getDaysInYear, setDefaultOptions } from "date-fns";
import { nb } from 'date-fns/locale';
import { filter, flow, groupBy, map, toPairs } from 'lodash';
import './jakttider.css';
import { jakttider } from './vilt';

type Hovedkategori = 'storvilt' | 'småvilt'

interface Vilt {
  storvilt?: boolean;
  kategori: string;
  name: string;
  start: Date;
  end: Date;
}

type ViltGruppe = [string, Vilt[]];

interface JaktIntervall {
  start: Date;
  end: Date;
}

setDefaultOptions({ locale: nb });

const year = new Date().getFullYear();

function getEaster(year: number) {
  var f = Math.floor,
    // Golden Number - 1
    G = year % 19,
    C = f(year / 100),
    // related to Epact
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    // number of days from 21 March to the Paschal full moon
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    // weekday for the Paschal full moon
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    // number of days from 21 March to the Sunday on or before the Paschal full moon
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);

  return [month, day];
}

const getPercentage = (day: number, daysInYear: number) => {
  return day * 100 / daysInYear;
}

const getTitle = (vilt: Vilt) => {
  const dateFormat = 'do LLL';
  const from = format(vilt.start, dateFormat);
  const to = format(vilt.end, dateFormat);

  return `${from} - ${to}`;
}

const getIntervals = (vilt: Vilt) => {
  const intervals: JaktIntervall[] = [];
  if (vilt.start.getTime() > vilt.end.getTime()) {
    intervals.push({ start: vilt.start, end: new Date(`${year}-12-23`) });
    intervals.push({ start: new Date(`${year + 1}-01-01`), end: vilt.end });
  } else {
    intervals.push({ start: vilt.start, end: vilt.end });
  }

  return intervals;
}

const getIntervalElement = (tid: JaktIntervall) => {
  const thisYearsDays = getDaysInYear(new Date(year, 0, 1));
  const getPercentageThisYear = (days: number) => getPercentage(days, thisYearsDays);

  const startDayOfYear = getDayOfYear(tid.start);
  const endDayOfYear = getDayOfYear(tid.end);

  const left = getPercentageThisYear(startDayOfYear - 1) + '%';
  const width = getPercentageThisYear(endDayOfYear - startDayOfYear + 1) + '%';

  const startDate = format(tid.start, 'dd.MM');
  const endDate = format(tid.end, 'dd.MM');

  return <div key={tid.start.getTime()} className='interval' style={{ width, left }}>
    <span className='marker start-marker'>{startDate}</span>
    <span className='marker end-marker'>{endDate}</span>
  </div>
}

const getForbiddenElement = (date: Date, interval: number) => {
  const thisYearsDays = getDaysInYear(new Date(year, 0, 1));
  const getPercentageThisYear = (days: number) => getPercentage(days, thisYearsDays);

  const startDayOfYear = getDayOfYear(date);

  const left = getPercentageThisYear(startDayOfYear) + '%';
  const width = getPercentageThisYear(interval) + '%';

  return <div key={date.getTime()} className='interval forbidden' style={{ width, left }}></div>
}

const getEasterIntervalElement = () => {
  const [_month, _date] = getEaster(year);
  const month = _month - 1;
  const day = _date - 1;
  const date = new Date(year, month, day);

  return getForbiddenElement(date, 3)
}

const getRomJulElement = () => {
  return getForbiddenElement(new Date(year, 11, 23), 8);
}

const getRow = (vilt: Vilt) => {
  const intervalElements = [
    getEasterIntervalElement(),
    getRomJulElement(),
    getIntervals(vilt).map(getIntervalElement)
  ];

  return <tr key={vilt.name}>
    <td style={{ whiteSpace: 'nowrap' }}>{vilt.name}</td>
    <td style={{ width: '100%' }}>
      <div className='year' title={getTitle(vilt)}>
        {intervalElements}
      </div>
    </td>
  </tr>
}

const getBodies = (hovedkategori: Hovedkategori) => {
  const hovedKategoriFilter = (_vilt: Vilt) => hovedkategori === "storvilt" ? _vilt.storvilt : !_vilt.storvilt;
  const filterOnHovedKategori = (_vilter: Vilt[]) => filter(_vilter, hovedKategoriFilter);
  const groupByKategori = (_vilter: Vilt[]) => groupBy(_vilter, 'kategori');
  const createBody = ([_key, _vilter]: ViltGruppe) =>
    <tbody key={_key}>
      <tr><td colSpan={2} className='kategori'>{_key}</td></tr>
      {map(_vilter, getRow)}
    </tbody>;

  return flow([
    filterOnHovedKategori,
    groupByKategori,
    toPairs,
    (pairs) => map(pairs, createBody)
  ])(jakttider);
}

export function JaktTider() {
  const storVilt = getBodies('storvilt');
  const småVilt = getBodies('småvilt');

  return (
    <div className="container">
      <div>
        <p>Ikke lov å jakte</p>

        <ul>
          <li>Langfredag, påskeaften, 1. påskedag</li>
          <li>24.12 til og med 31.12</li>
        </ul>
      </div>

      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <td colSpan={2} style={{ textAlign: 'center' }}>
              <h1>Storvilt</h1>
            </td>
          </tr>
        </thead>

        {storVilt}
      </table>

      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <td colSpan={2} style={{ textAlign: 'center' }}>
              <h1>Småvilt</h1>
            </td>
          </tr>
        </thead>

        {småVilt}
      </table>
    </div >
  )
}