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

setDefaultOptions({ locale: nb })

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
  const year = new Date().getFullYear();

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
  const thisYearsDays = getDaysInYear(new Date());
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

const getRow = (vilt: Vilt) => {
  const intervalElements = getIntervals(vilt).map(getIntervalElement);

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