import { format, getDayOfYear, getDaysInYear, setDefaultOptions } from "date-fns";
import { nb } from 'date-fns/locale';
import { groupBy } from 'lodash';
import './jakttider.css';
import { jakttider } from './vilt';

type Hovedkategori = 'storvilt' | 'småvilt'

interface Vilt {
  kategori?: string;
  name: string;
  start: Date;
  end: Date;
}

interface JaktIntervall {
  start: Date;
  end: Date;
}

setDefaultOptions({ locale: nb })

const getPercentage = (day: number, daysInYear: number) => {
  return day * 100 / daysInYear;
}

const getBodies = (hovedkategori: Hovedkategori) => {
  const vilt = jakttider
    .filter(tid => hovedkategori === "storvilt" ? tid.storvilt : !tid.storvilt)

  const groups = groupBy(vilt, 'kategori');

  return Object.entries(groups).map(([key, vilter]) => {
    const rows = vilter.map(getRow);

    return <tbody>
      <tr><td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>{key}</td></tr>
      {rows}
    </tbody>
  })
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

const getRow = (vilt: Vilt) => {
  const intervalElements = getIntervals(vilt).map(getIntervalElement);

  return <tr>
    <td style={{ whiteSpace: 'nowrap' }}>{vilt.name}</td>
    <td style={{ width: '100%' }}>
      <div className='year' title={getTitle(vilt)}>
        {intervalElements}
      </div>
    </td>
  </tr>
}

const getIntervalElement = (tid: JaktIntervall) => {
  const thisYearsDays = getDaysInYear(new Date());
  const getPercentageThisYear = (days: number) => getPercentage(days, thisYearsDays);

  const startDayOfYear = getDayOfYear(tid.start);
  const endDayOfYear = getDayOfYear(tid.end);

  const left = getPercentageThisYear(startDayOfYear - 1) + '%';
  const width = getPercentageThisYear(endDayOfYear - startDayOfYear + 1) + '%';

  return <div className='interval'
    style={{ width, left }}>
  </div>
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